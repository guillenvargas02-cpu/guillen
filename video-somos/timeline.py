"""Single source of truth for the edit (30 fps)."""
import math
FPS = 30
INTRO_F = 59           # 1.967 s
OUTRO_F = 145          # 4.833 s
# source frame ranges [a, b) kept, in order, with zoom spec (z0, z1, kind)
SEGS = [
    (21, 78),     # Hola, soy Eduardo Contró
    (88, 228),    # Cuando los ciudadanos ... sucedan
    (242, 417),   # Hoy ... cruzados
    (428, 1120),  # Tenemos ... comunidad (contains phone section)
    (1160, 1262), # Muchos ya dimos ese paso. Solo faltas TÚ (+ finale)
]
# zoom "shots": source-frame start -> (z_start, z_end); applies until next shot
SHOTS = [
    (21, 1.00, 1.03), (88, 1.10, 1.12), (242, 1.00, 1.03), (428, 1.10, 1.12),
    (574, 1.00, 1.025), (654, 1.12, 1.14), (918, 1.00, 1.03), (1023, 1.10, 1.12),
    (1160, 1.00, 1.05), (1235, 1.17, 1.22),
]
ANCHOR = (0.5, 0.47)    # face-centred zoom anchor (fraction of frame)
PHONE_SRC0 = 815        # src frame where phone overlay starts (27.17 s)
LINK_SRC0 = 785         # link icon + pointing-down emoji (26.17 s, 'una liga')
LINK_F = 32
PHONE_F = 96            # 3.43 s of phone time at 1.08x
TU_SRC = 41.16          # 'tú' onset (src s)
FINALE_SRC = 41.80      # white pill starts expanding to the outro
MUSIC_DROP = 107.733    # s in music file
MUSIC_START = MUSIC_DROP - INTRO_F / FPS

SPEED = 1.08            # speaker segments play 8% faster (pitch-preserving voice stretch)
def seg_len(a, b): return int(round((b - a) / SPEED))

def build_map():
    """list of output frames -> ('intro', i) | ('src', srcframe) | ('outro', i)"""
    m = [('intro', i) for i in range(INTRO_F)]
    for a, b in SEGS:
        m += [('src', min(b - 1, a + int(round(k * SPEED)))) for k in range(seg_len(a, b))]
    m += [('outro', i) for i in range(OUTRO_F)]
    return m

def src_to_out(srcf):
    o = INTRO_F
    for a, b in SEGS:
        if a <= srcf < b: return o + int(round((srcf - a) / SPEED))
        o += seg_len(a, b)
    return None

def src_time_to_out(t):
    """map source seconds -> output seconds (None if cut)"""
    o = INTRO_F / FPS
    for a, b in SEGS:
        ta, tb = a / FPS, b / FPS
        if ta <= t < tb: return o + (t - ta) / SPEED
        o += seg_len(a, b) / FPS
    return None

TOTAL_F = INTRO_F + sum(seg_len(a, b) for a, b in SEGS) + OUTRO_F
OUTRO_START_F = TOTAL_F - OUTRO_F

KEYWORDS = {"Eduardo", "Contró", "ciudadanos", "organizamos", "sucedan", "México", "brazos", "cruzados",
            "oportunidad", "oro", "alternativa", "rumbo", "Miguel", "Hidalgo", "SOMOS", "liga", "firma",
            "fuerza", "gran", "proyecto", "familias", "comunidad", "paso", "tú"}
# caption chunks: list of word indices groups (by text), resolved against words.json
CHUNKS = ["Hola, soy", "Eduardo Contró.", "Cuando los ciudadanos", "nos organizamos,", "podemos hacer",
          "que las cosas sucedan.", "Hoy, desafortunadamente,", "México no va", "por buen camino",
          "y no podemos quedarnos", "de brazos cruzados.", "Tenemos una oportunidad", "de oro", "para construir",
          "una alternativa", "y cambiar el rumbo.", "Y ese cambio empieza", "en Miguel Hidalgo.", "Por eso,",
          "te quiero invitar", "a formar parte de Somos.", "Y es así que", "te quiero hacer llegar", "una liga",
          "para que nos puedas", "regalar tu firma", "y darle mayor fuerza", "a este gran proyecto", "que va a llegar",
          "demasiado lejos", "por el bien", "de nuestras familias", "y por el bien", "de nuestra comunidad.",
          "Muchos ya dimos", "ese paso.", "Solo faltas", "tú."]
