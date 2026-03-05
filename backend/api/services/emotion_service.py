"""
api/services/emotion_service.py
Amdox AI — Emotion Analysis Service
Handles: Text (Hinglish + English), Face (DeepFace), Voice (wav2vec2)
"""

import base64
import io
import math
import numpy as np
import os
import platform
import shutil
from dotenv import load_dotenv
load_dotenv()

# ── FFmpeg path set karo (pydub ke liye) ──────────────────────
try:
    import platform
    import shutil
    from pydub import AudioSegment

    if platform.system() == "Windows":
        _ffmpeg = os.getenv(
            "FFMPEG_PATH",
            r"C:\Users\HP\Downloads\ffmpeg-8.0.1-essentials_build\ffmpeg-8.0.1-essentials_build\bin\ffmpeg.exe"
        )
        _ffprobe = _ffmpeg.replace("ffmpeg.exe", "ffprobe.exe")
    else:
        # Linux (Render) — imageio-ffmpeg use karo
        try:
            import imageio_ffmpeg
            _ffmpeg  = imageio_ffmpeg.get_ffmpeg_exe()
            _ffprobe = _ffmpeg.replace("ffmpeg", "ffprobe")
        except Exception:
            _ffmpeg  = shutil.which("ffmpeg") or "ffmpeg"
            _ffprobe = shutil.which("ffprobe") or "ffprobe"

    AudioSegment.converter = _ffmpeg
    AudioSegment.ffmpeg    = _ffmpeg
    AudioSegment.ffprobe   = _ffprobe
    PYDUB_AVAILABLE = True
    print(f"✅ pydub + FFmpeg configured: {_ffmpeg}")
except Exception as _e:
    PYDUB_AVAILABLE = False
    print(f"⚠️  pydub not available: {_e}")


# ─────────────────────────────────────────────
# SECTION 1 — TEXT EMOTION ANALYSIS
# Supports: English + Hinglish keywords + TextBlob sentiment
# ─────────────────────────────────────────────

try:
    from textblob import TextBlob
    TEXTBLOB_AVAILABLE = True
except ImportError:
    TEXTBLOB_AVAILABLE = False
    print("⚠️  TextBlob not installed — using keyword-only mode")

# Stress type emotions (used by stress monitor)
STRESS_EMOTIONS = {"Stress", "Sad", "Angry", "Fear", "Disgust"}

# Keyword maps — English + Hinglish
EMOTION_KEYWORDS = {
    "Stress": [
        # English
        "stress", "stressed", "overwhelm", "overwhelmed", "burnout", "burnt out",
        "exhausted", "exhaustion", "pressure", "deadline", "overloaded", "overwork",
        "too much work", "can't cope", "cannot cope", "breakdown", "panic", "panicking",
        # Hinglish
        "tension", "bahut tension", "bahut pressure", "kaam bahut zyada", "thak gaya",
        "thak gayi", "sar dard", "pagal ho raha", "pagal ho rahi", "dimag kharab",
        "aur nahi ho sakta", "aur nahi ho sakti", "sambhal nahi paa raha",
        "sambhal nahi paa rahi", "zyada pressure", "deadline aa rahi", "mushkil ho raha",
    ],
    "Sad": [
        # English
        "sad", "unhappy", "depressed", "depression", "lonely", "alone", "hopeless",
        "helpless", "crying", "cried", "miserable", "heartbroken", "down", "low",
        "gloomy", "sorrow", "grief", "disappointed", "disappointment",
        # Hinglish
        "dukhi", "udaas", "akela", "akeli", "rona aa raha", "nirash", "nirashajanit",
        "toot gaya", "toot gayi", "dil dukha", "bahut bura lag raha", "maza nahi",
        "kuch acha nahi lag raha", "man nahi kar raha",
    ],
    "Angry": [
        # English
        "angry", "anger", "furious", "frustrated", "frustration", "irritated",
        "irritating", "annoyed", "annoying", "rage", "hate", "hatred", "mad",
        "disgusted", "unfair", "outraged",
        # Hinglish
        "gussa", "bahut gussa", "chidchida", "naraz", "pareshan", "tang aa gaya",
        "tang aa gayi", "pagal kar diya", "pagal kar di", "galat hai", "ye sahi nahi",
        "galat ho raha", "bahut bura kiya",
    ],
    "Fear": [
        # English
        "scared", "fear", "afraid", "frightened", "terrified", "anxious", "anxiety",
        "nervous", "worried", "worry", "dread", "panic", "insecure", "insecurity",
        "losing my job", "getting fired", "what if",
        # Hinglish
        "dar lag raha", "dar lag rahi", "dara hua", "ghabra raha", "ghabra rahi",
        "ghabrahat", "chinta", "bahut chinta", "kya hoga", "job jayegi", "kuch bura hoga",
        "akele dar lag raha", "naukri jayegi",
    ],
    "Happy": [
        # English
        "happy", "happiness", "glad", "excited", "excited", "joy", "joyful",
        "wonderful", "great", "fantastic", "amazing", "love", "loving", "excellent",
        "awesome", "positive", "energetic", "motivated", "productive", "good mood",
        # Hinglish
        "khush", "bahut khush", "maza aa raha", "mast", "acha lag raha", "acha lag rahi",
        "sab theek", "sab acha", "productive feel", "energy hai", "motivated hoon",
        "maja aa gaya", "maja aa gayi",
    ],
    "Surprise": [
        # English
        "surprised", "surprise", "unexpected", "shocking", "shocked", "unbelievable",
        "wow", "omg", "cannot believe", "can't believe",
        # Hinglish
        "hairan", "achanak", "sochaa nahi tha", "yeh unexpected tha", "kya baat hai",
        "sach mein", "seriously", "believe nahi ho raha",
    ],
    "Neutral": [
        "okay", "fine", "normal", "usual", "routine", "regular", "average",
        "completed tasks", "finished work", "done for today",
        "theek", "theek hai", "normal hai", "kaam ho gaya", "sab theek chal raha",
    ],
}

# Confidence boosts for multi-keyword matches
CONFIDENCE_BOOSTS = {
    "Stress":   0.10,
    "Sad":      0.08,
    "Angry":    0.09,
    "Fear":     0.08,
    "Happy":    0.07,
    "Surprise": 0.05,
    "Neutral":  0.04,
}

# Stress level per emotion
STRESS_LEVELS = {
    "Stress":   0.90,
    "Fear":     0.80,
    "Angry":    0.78,
    "Sad":      0.65,
    "Disgust":  0.60,
    "Surprise": 0.30,
    "Neutral":  0.20,
    "Happy":    0.10,
}

# Task suggestions per emotion
TASK_SUGGESTIONS = {
    "Stress":   "🚨 Take a break NOW. HR has been notified. Step away and rest.",
    "Fear":     "🤝 Talk to your team lead. Break your tasks into smaller steps.",
    "Angry":    "🧘 Step away for 5 minutes. Deep breaths. Avoid important decisions now.",
    "Sad":      "☕ Take a 10-minute break. Hydrate. Start with easy tasks.",
    "Disgust":  "📝 Focus on creative work. Avoid repetitive tasks for now.",
    "Surprise": "🔍 Good discovery mode. Explore new challenges.",
    "Happy":    "✅ Great state! Take on complex and creative work.",
    "Neutral":  "📋 Good for routine tasks, meetings, and focused work.",
}


def analyze_text(text: str) -> dict:
    text_lower = text.lower().strip()

    emotion_scores = {}
    for emotion, keywords in EMOTION_KEYWORDS.items():
        score = 0
        matches = 0
        for kw in keywords:
            if kw in text_lower:
                matches += 1
                score += 0.6 + len(kw.split()) * 0.05
        if matches > 1:
            score += CONFIDENCE_BOOSTS.get(emotion, 0) * matches
        if score > 0:
            emotion_scores[emotion] = min(score, 1.0)

    polarity = 0.0
    if TEXTBLOB_AVAILABLE:
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
        except Exception:
            polarity = 0.0

    if polarity > 0.3:
        emotion_scores["Happy"] = max(emotion_scores.get("Happy", 0), polarity * 0.75)
    elif polarity < -0.4:
        for em in ["Stress", "Sad", "Angry"]:
            if em in emotion_scores:
                emotion_scores[em] = min(emotion_scores[em] + abs(polarity) * 0.2, 1.0)

    if emotion_scores:
        dominant = max(emotion_scores, key=emotion_scores.get)
        base_conf = emotion_scores[dominant]
        confidence = round(0.55 + base_conf * 0.42, 3)
        confidence = max(0.55, min(0.97, confidence))
    else:
        if polarity > 0.2:
            dominant, confidence = "Happy", 0.62
        elif polarity < -0.2:
            dominant, confidence = "Stress", 0.60
        else:
            dominant, confidence = "Neutral", 0.58

    stress_level = STRESS_LEVELS.get(dominant, 0.3)
    task = TASK_SUGGESTIONS.get(dominant, TASK_SUGGESTIONS["Neutral"])

    return {
        "emotion": dominant,
        "confidence": confidence,
        "stress_level": round(stress_level, 3),
        "task": task,
        "source": "TEXT",
    }


# ─────────────────────────────────────────────
# SECTION 2 — FACE EMOTION ANALYSIS (DeepFace)
# ─────────────────────────────────────────────

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    print("⚠️  opencv-python not installed — face analysis unavailable")

try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
    print("✅ DeepFace loaded successfully")
except ImportError:
    DEEPFACE_AVAILABLE = False
    print("⚠️  DeepFace not installed — using fallback face analysis")


def analyze_face(image_base64: str) -> dict:
    try:
        if "," in image_base64:
            image_base64 = image_base64.split(",", 1)[1]

        img_bytes = base64.b64decode(image_base64)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)

        if not CV2_AVAILABLE:
            raise ImportError("opencv not available")

        frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Could not decode image")

    except Exception as e:
        print(f"❌ Image decode error: {e}")
        return _face_fallback()

    if not DEEPFACE_AVAILABLE:
        return _face_fallback()

    try:
        analysis = DeepFace.analyze(
            img_path=frame,
            actions=["emotion"],
            enforce_detection=False,
            silent=True,
        )

        if isinstance(analysis, list):
            analysis = analysis[0]

        raw_emotions = analysis.get("emotion", {})

        if not raw_emotions:
            return _face_fallback()

        dominant_raw = max(raw_emotions, key=raw_emotions.get)
        dominant_score = raw_emotions[dominant_raw]

        DEEPFACE_MAP = {
            "angry":    "Angry",
            "disgust":  "Disgust",
            "fear":     "Fear",
            "happy":    "Happy",
            "sad":      "Sad",
            "surprise": "Surprise",
            "neutral":  "Neutral",
        }
        emotion = DEEPFACE_MAP.get(dominant_raw.lower(), "Neutral")

        confidence = round(0.50 + (dominant_score / 100) * 0.47, 3)
        confidence = max(0.50, min(0.97, confidence))

        probs = list(raw_emotions.values())
        total = sum(probs) or 1
        norm_probs = [p / total for p in probs]
        entropy = -sum(p * math.log(p + 1e-9) for p in norm_probs)
        max_entropy = math.log(len(probs) + 1e-9)
        uncertainty = entropy / (max_entropy + 1e-9)
        confidence = round(confidence * (1 - uncertainty * 0.25), 3)
        confidence = max(0.50, min(0.97, confidence))

        stress_level = STRESS_LEVELS.get(emotion, 0.3)
        task = TASK_SUGGESTIONS.get(emotion, TASK_SUGGESTIONS["Neutral"])

        return {
            "emotion": emotion,
            "confidence": confidence,
            "stress_level": round(stress_level, 3),
            "task": task,
            "source": "FACE",
            "raw_scores": {DEEPFACE_MAP.get(k, k): round(v, 1) for k, v in raw_emotions.items()},
        }

    except Exception as e:
        print(f"❌ DeepFace analysis error: {e}")
        return _face_fallback()


def _face_fallback() -> dict:
    return {
        "emotion": "Neutral",
        "confidence": 0.60,
        "stress_level": 0.20,
        "task": TASK_SUGGESTIONS["Neutral"],
        "source": "FACE",
        "raw_scores": {},
    }


# ─────────────────────────────────────────────
# SECTION 3 — VOICE EMOTION ANALYSIS (wav2vec2)
# ─────────────────────────────────────────────

_voice_model = None
_voice_feature_extractor = None
_voice_loaded = False


def _load_voice_model():
    global _voice_model, _voice_feature_extractor, _voice_loaded
    if _voice_loaded:
        return _voice_loaded

    try:
        from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
        import torch

        model_name = "superb/wav2vec2-base-superb-er"
        print(f"⏳ Loading voice model: {model_name} ...")
        _voice_feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)
        _voice_model = AutoModelForAudioClassification.from_pretrained(model_name)
        _voice_model.eval()
        _voice_loaded = True
        print("✅ Voice model loaded")
    except Exception as e:
        print(f"⚠️  Voice model load failed: {e}")
        _voice_loaded = False

    return _voice_loaded


SUPERB_EMOTION_MAP = {
    "neu": "Neutral",
    "hap": "Happy",
    "ang": "Angry",
    "sad": "Sad",
    "fea": "Fear",
    "dis": "Disgust",
    "sur": "Surprise",
    "exc": "Happy",
    "fru": "Stress",
    "cal": "Neutral",
    "oth": "Neutral",
}


def analyze_voice(audio_bytes: bytes) -> dict:
    model_ok = _load_voice_model()

    if not model_ok:
        return _voice_fallback()

    try:
        import torch
        import soundfile as sf
        import tempfile

        waveform = None
        sample_rate = 16000

        # ── Method 1: soundfile direct ────────────────────────
        try:
            audio_io = io.BytesIO(audio_bytes)
            waveform, sample_rate = sf.read(audio_io)
            print("✅ Audio decoded via soundfile")
        except Exception:
            pass

        # ── Method 2: pydub (WebM/Opus/MP4 → WAV) ────────────
        if waveform is None and PYDUB_AVAILABLE:
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as f:
                    f.write(audio_bytes)
                    tmp_in = f.name

                tmp_out = tmp_in.replace('.webm', '.wav')
                audio_seg = AudioSegment.from_file(tmp_in)
                audio_seg = audio_seg.set_channels(1).set_frame_rate(16000)
                audio_seg.export(tmp_out, format='wav')
                waveform, sample_rate = sf.read(tmp_out)

                os.unlink(tmp_in)
                os.unlink(tmp_out)
                print("✅ Audio decoded via pydub")
            except Exception as e2:
                print(f"pydub decode error: {e2}")

        # ── Method 3: librosa ─────────────────────────────────
        if waveform is None:
            try:
                import librosa
                with tempfile.NamedTemporaryFile(delete=False, suffix='.audio') as f:
                    f.write(audio_bytes)
                    tmp = f.name
                waveform, sample_rate = librosa.load(tmp, sr=16000, mono=True)
                os.unlink(tmp)
                print("✅ Audio decoded via librosa")
            except Exception as e3:
                print(f"librosa decode error: {e3}")

        if waveform is None:
            print("❌ All audio decode methods failed")
            return _voice_fallback()

        # Convert stereo → mono
        if waveform.ndim > 1:
            waveform = waveform.mean(axis=1)

        # Resample to 16kHz
        if sample_rate != 16000:
            try:
                import librosa
                waveform = librosa.resample(
                    waveform.astype(np.float32),
                    orig_sr=sample_rate,
                    target_sr=16000
                )
                sample_rate = 16000
            except Exception:
                pass

        waveform = waveform.astype(np.float32)

        # Feature extraction + inference
        inputs = _voice_feature_extractor(
            waveform,
            sampling_rate=sample_rate,
            return_tensors="pt",
            padding=True,
        )

        with torch.no_grad():
            logits = _voice_model(**inputs).logits

        probs = torch.softmax(logits, dim=-1)[0]
        top_idx   = probs.argmax().item()
        top_score = probs[top_idx].item()

        id2label  = _voice_model.config.id2label
        raw_label = id2label.get(top_idx, "neu").lower()
        emotion   = SUPERB_EMOTION_MAP.get(raw_label, "Neutral")

        all_probs   = probs.numpy()
        entropy     = -sum(p * math.log(p + 1e-9) for p in all_probs)
        max_entropy = math.log(len(all_probs) + 1e-9)
        uncertainty = entropy / (max_entropy + 1e-9)

        confidence = round(top_score * (1 - uncertainty * 0.3), 3)
        confidence = max(0.50, min(0.96, confidence))

        stress_level = STRESS_LEVELS.get(emotion, 0.3)
        task = TASK_SUGGESTIONS.get(emotion, TASK_SUGGESTIONS["Neutral"])

        return {
            "emotion": emotion,
            "confidence": confidence,
            "stress_level": round(stress_level, 3),
            "task": task,
            "source": "VOICE",
        }

    except Exception as e:
        print(f"❌ Voice analysis error: {e}")
        return _voice_fallback()


def _voice_fallback() -> dict:
    return {
        "emotion": "Neutral",
        "confidence": 0.60,
        "stress_level": 0.20,
        "task": TASK_SUGGESTIONS["Neutral"],
        "source": "VOICE",
    }