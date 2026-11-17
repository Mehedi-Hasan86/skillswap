#!/usr/bin/env python3
# Generate C4 model diagrams for SkillSwap (Lab Report 6)
# Levels: 1 Context, 2 Container, 3 Component, 4 Code (optional)
import os, math
from PIL import Image, ImageDraw, ImageFont

OUT = "/mnt/d/iiuc/semester_06/cse_3638_software_engineering_lab/skillswap/lab_report_6"
FONT_DIR = "/usr/share/fonts/truetype/dejavu"

# C4 standard palette
C_PERSON   = "#08427B"
C_SYSTEM   = "#1168BD"
C_CONTAINER= "#438DD5"
C_COMPONENT= "#85BBF0"
C_EXTERNAL = "#999999"
C_DB       = "#438DD5"
C_TEXT     = "#000000"
C_WHITE    = "#FFFFFF"

def font(size, bold=False):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    return ImageFont.truetype(os.path.join(FONT_DIR, name), int(size))

def text_w(draw, text, f):
    return draw.textlength(text, font=f)

def draw_text_block(draw, cx, cy, lines, f, color=C_TEXT, spacing=1.25):
    flat = []
    for ln in lines:
        flat.extend(ln.split("\n"))
    lh = f.size * spacing
    total = lh * len(flat)
    y = cy - total / 2 + (lh - f.size) / 2
    for ln in flat:
        w = text_w(draw, ln, f)
        draw.text((cx - w / 2, y), ln, font=f, fill=color)
        y += lh

def rounded_box(draw, box, fill, outline, width=2, radius=12):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def arrow(draw, p1, p2, color="#333333", width=3, head=12):
    draw.line([p1, p2], fill=color, width=width)
    ang = math.atan2(p2[1] - p1[1], p2[0] - p1[0])
    h1 = (p2[0] - head * math.cos(ang - 0.45), p2[1] - head * math.sin(ang - 0.45))
    h2 = (p2[0] - head * math.cos(ang + 0.45), p2[1] - head * math.sin(ang + 0.45))
    draw.polygon([p2, h1, h2], fill=color)

def arrow_label(draw, p1, p2, text, f, dist=42, side=1, color="#333333"):
    """Place text beside the midpoint of a segment, offset perpendicular."""
    mx, my = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
    dx, dy = p2[0] - p1[0], p2[1] - p1[1]
    L = math.hypot(dx, dy) or 1
    px, py = -dy / L, dx / L
    lx, ly = mx + side * dist * px, my + side * dist * py
    w = text_w(draw, text, f)
    draw.text((lx - w / 2, ly - f.size / 2), text, font=f, fill=color)

def person_icon(draw, box, color=C_PERSON):
    x0, y0, x1, y1 = box
    rounded_box(draw, (x0, y0, x1, y1), C_WHITE, color, width=3, radius=14)
    cx = (x0 + x1) / 2
    hr = (y1 - y0) * 0.11
    hy = y0 + (y1 - y0) * 0.28
    draw.ellipse([cx - hr, hy - hr, cx + hr, hy + hr], outline=color, width=3)
    sy = hy + hr * 1.7
    draw.arc([cx - (y1 - y0) * 0.22, sy - (y1 - y0) * 0.08,
              cx + (y1 - y0) * 0.22, sy + (y1 - y0) * 0.5], 180, 360, fill=color, width=3)

def cylinder(draw, box, fill=C_DB, outline="#2f6fb0", width=3):
    x0, y0, x1, y1 = box
    eh = (y1 - y0) * 0.12
    draw.rounded_rectangle([x0, y0 + eh / 2, x1, y1 - eh / 2], radius=8, fill=fill, outline=outline, width=width)
    draw.ellipse([x0, y0, x1, y0 + eh * 2], fill=fill, outline=outline, width=width)
    draw.ellipse([x0, y1 - eh * 2, x1, y1], fill=fill, outline=outline, width=width)

def save(img, name):
    p = os.path.join(OUT, name)
    img.save(p)
    print("saved", p, img.size)

# ---------------- LEVEL 1: CONTEXT ----------------
def level1():
    W, H = 1500, 1050
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    fs = font(22, True); fl = font(18); fsm = font(15)
    sys_box = (520, 360, 980, 620)
    rounded_box(d, sys_box, C_SYSTEM, "#0d4f91", width=4, radius=16)
    draw_text_block(d, (sys_box[0]+sys_box[2])/2, 460, ["SkillSwap Platform"], fs, C_WHITE)
    draw_text_block(d, (sys_box[0]+sys_box[2])/2, 540, ["[Software System]"], fsm, "#dbe9f8")
    p_student = (140, 180, 460, 420)
    person_icon(d, p_student)
    draw_text_block(d, (p_student[0]+p_student[2])/2, 350, ["Student"], fl)
    draw_text_block(d, (p_student[0]+p_student[2])/2, 388, ["(Teacher / Learner)"], fsm, "#555555")
    p_admin = (140, 640, 460, 880)
    person_icon(d, p_admin)
    draw_text_block(d, (p_admin[0]+p_admin[2])/2, 810, ["Administrator"], fl)
    draw_text_block(d, (p_admin[0]+p_admin[2])/2, 848, ["(Campus Moderator)"], fsm, "#555555")
    g_box = (1000, 80, 1400, 260)
    rounded_box(d, g_box, C_EXTERNAL, "#666666", width=4, radius=16)
    draw_text_block(d, (g_box[0]+g_box[2])/2, 150, ["Google Identity"], fs, C_WHITE)
    draw_text_block(d, (g_box[0]+g_box[2])/2, 200, ["Provider"], fsm, "#e0e0e0")
    db_box = (1000, 700, 1400, 900)
    cylinder(d, db_box)
    draw_text_block(d, (db_box[0]+db_box[2])/2, 760, ["MongoDB"], fs, C_WHITE)
    draw_text_block(d, (db_box[0]+db_box[2])/2, 810, ["[Data Store]"], fsm, "#e0e0e0")
    arrow(d, (p_student[2], (p_student[1]+p_student[3])/2), (sys_box[0], 470))
    arrow(d, (p_admin[2], (p_admin[1]+p_admin[3])/2), (sys_box[0], 520))
    arrow(d, (sys_box[2], 430), (g_box[0], (g_box[1]+g_box[3])/2))
    arrow(d, (sys_box[2], 560), (db_box[0], (db_box[1]+db_box[3])/2))
    arrow_label(d, (p_student[2], 300), (sys_box[0], 470), "Uses platform", fsm, dist=36, side=1)
    arrow_label(d, (p_admin[2], 760), (sys_box[0], 520), "Administers", fsm, dist=36, side=-1)
    arrow_label(d, (sys_box[2], 430), (g_box[0], 170), "Sign-In (OAuth)", fsm, dist=40, side=-1)
    arrow_label(d, (sys_box[2], 560), (db_box[0], 800), "Stores data", fsm, dist=40, side=-1)
    save(img, "c4_level1_context.png")

# ---------------- LEVEL 2: CONTAINER ----------------
def level2():
    W, H = 1560, 1080
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    fs = font(22, True); fc = font(20, True); fl = font(17); fsm = font(14)
    bnd = (240, 120, 1240, 900)
    d.rounded_rectangle(bnd, radius=20, outline="#1168BD", width=3)
    d.text((bnd[0]+20, bnd[1]+12), "SkillSwap Platform", font=fs, fill="#1168BD")
    s1 = (330, 240, 780, 470)     # SPA
    rounded_box(d, s1, C_CONTAINER, "#2f6fb0", width=3, radius=14)
    draw_text_block(d, (s1[0]+s1[2])/2, 300, ["Single-Page App (React)"], fc, C_WHITE)
    draw_text_block(d, (s1[0]+s1[2])/2, 348, ["[Container: Browser]"], fsm, "#e6f0fa")
    draw_text_block(d, (s1[0]+s1[2])/2, 410, ["Pages, AuthContext,\nAxios API client"], fl, C_WHITE)
    s2 = (330, 560, 780, 830)     # API
    rounded_box(d, s2, C_CONTAINER, "#2f6fb0", width=3, radius=14)
    draw_text_block(d, (s2[0]+s2[2])/2, 620, ["Express REST API"], fc, C_WHITE)
    draw_text_block(d, (s2[0]+s2[2])/2, 668, ["[Container: Node.js]"], fsm, "#e6f0fa")
    draw_text_block(d, (s2[0]+s2[2])/2, 745, ["Routes, middleware,\nmatching engine"], fl, C_WHITE)
    db = (950, 600, 1180, 860)    # MongoDB bottom-right
    cylinder(d, db)
    draw_text_block(d, (db[0]+db[2])/2, 680, ["MongoDB"], fc, C_WHITE)
    draw_text_block(d, (db[0]+db[2])/2, 728, ["[Container: DB]"], fsm, "#e6f0fa")
    draw_text_block(d, (db[0]+db[2])/2, 795, ["Fallback: in-memory\nstore"], fl, C_WHITE)
    g = (950, 120, 1180, 320)     # Firebase top-right
    rounded_box(d, g, C_EXTERNAL, "#666666", width=3, radius=14)
    draw_text_block(d, (g[0]+g[2])/2, 190, ["Firebase Auth"], fc, C_WHITE)
    draw_text_block(d, (g[0]+g[2])/2, 245, ["[External]"], fsm, "#e0e0e0")
    pu = (60, 240, 250, 470)
    person_icon(d, pu)
    draw_text_block(d, (pu[0]+pu[2])/2, 300, ["User"], fl)
    draw_text_block(d, (pu[0]+pu[2])/2, 350, ["(Student /\nAdmin)"], fsm, "#555555")
    # arrows
    a1 = ((pu[2], 355), (s1[0], 355))        # User -> SPA
    a2 = ((555, s1[3]), (555, s2[1]))         # SPA -> API (vertical)
    a3 = ((s2[2], 760), (db[0], 720))         # API -> MongoDB
    a4 = ((s2[2], 600), (g[0], 300))          # API -> Firebase (verify)
    a5 = ((s1[2], 290), (g[0], 210))          # SPA -> Firebase (popup)
    arrow(d, *a1); arrow(d, *a2); arrow(d, *a3); arrow(d, *a4); arrow(d, *a5)
    # explicit label coordinates (clearly off the lines, no overlap)
    d.text((265, 330), "Logs in", font=fsm, fill="#333333")
    d.text((580, 512), "HTTPS / JSON", font=fsm, fill="#333333")
    d.text((790, 780), "Mongoose ODM", font=fsm, fill="#333333")
    d.text((790, 500), "Verify ID token", font=fsm, fill="#333333")
    d.text((800, 235), "Google sign-in", font=fsm, fill="#333333")
    save(img, "c4_level2_container.png")

# ---------------- LEVEL 3: COMPONENT ----------------
def level3():
    W, H = 1620, 1120
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    fs = font(22, True); fh = font(19, True); fc = font(16, True); fl = font(14); fsm = font(12)
    bnd = (250, 100, 1420, 1000)
    d.rounded_rectangle(bnd, radius=20, outline="#438DD5", width=3)
    d.text((bnd[0]+20, bnd[1]+12), "Express REST API  [Container]", font=fs, fill="#1168BD")
    rbox = (320, 190, 700, 520)
    rounded_box(d, rbox, C_COMPONENT, "#5a9fd6", width=3, radius=12)
    draw_text_block(d, (rbox[0]+rbox[2])/2, 220, ["Route Handlers"], fh, C_TEXT)
    routes = ["auth", "users", "skills", "requests", "sessions",
              "reviews", "reports", "credits", "admin"]
    xa = rbox[0] + 50
    for i, r in enumerate(routes):
        col = i // 5; row = i % 5
        cx = xa + col * 170
        cy = 265 + row * 48
        draw_text_block(d, cx, cy, [r], fc, C_TEXT)
    mbox = (320, 590, 700, 830)
    rounded_box(d, mbox, C_COMPONENT, "#5a9fd6", width=3, radius=12)
    draw_text_block(d, (mbox[0]+mbox[2])/2, 625, ["Middleware"], fh, C_TEXT)
    draw_text_block(d, (mbox[0]+mbox[2])/2, 680, ["JWT Auth Guard\n(authRequired)"], fl, C_TEXT)
    draw_text_block(d, (mbox[0]+mbox[2])/2, 760, ["Admin Guard\n(adminOnly)"], fl, C_TEXT)
    bbox = (790, 190, 1160, 470)
    rounded_box(d, bbox, C_COMPONENT, "#5a9fd6", width=3, radius=12)
    draw_text_block(d, (bbox[0]+bbox[2])/2, 225, ["Business Logic"], fh, C_TEXT)
    draw_text_block(d, (bbox[0]+bbox[2])/2, 300, ["Matching Engine\n(match.js, 100-pt)"], fl, C_TEXT)
    draw_text_block(d, (bbox[0]+bbox[2])/2, 380, ["Credit Economy\n(creditTx)"], fl, C_TEXT)
    draw_text_block(d, (bbox[0]+bbox[2])/2, 440, ["Reputation / Badges"], fl, C_TEXT)
    dbox = (790, 560, 1160, 830)
    rounded_box(d, dbox, C_COMPONENT, "#5a9fd6", width=3, radius=12)
    draw_text_block(d, (dbox[0]+dbox[2])/2, 595, ["Data Access Layer"], fh, C_TEXT)
    models = ["User", "Skill", "SwapRequest", "Session", "Review", "Report"]
    for i, m in enumerate(models):
        col = i // 3; row = i % 3
        cx = dbox[0] + 110 + col * 140
        cy = 650 + row * 48
        draw_text_block(d, cx, cy, [m + " model"], fl, C_TEXT)
    cbox = (1230, 190, 1400, 470)
    rounded_box(d, cbox, C_COMPONENT, "#5a9fd6", width=3, radius=12)
    draw_text_block(d, (cbox[0]+cbox[2])/2, 220, ["Config"], fh, C_TEXT)
    draw_text_block(d, (cbox[0]+cbox[2])/2, 290, ["db.js\n(Mongo / in-mem)"], fl, C_TEXT)
    draw_text_block(d, (cbox[0]+cbox[2])/2, 380, ["firebase.js"], fl, C_TEXT)
    db = (1230, 600, 1400, 820)
    cylinder(d, db)
    draw_text_block(d, (db[0]+db[2])/2, 660, ["MongoDB"], fc, C_WHITE)
    draw_text_block(d, (db[0]+db[2])/2, 715, ["or in-memory"], fsm, "#e0e0e0")
    arrow(d, (700, 350), (790, 350))
    arrow(d, (700, 700), (790, 700))
    arrow(d, (975, 470), (975, 560))
    arrow(d, (1160, 620), (1230, 680))
    d.text((720, 330), "calls", font=fsm, fill="#333333")
    d.text((990, 512), "queries", font=fsm, fill="#333333")
    d.text((1030, 700), "reads/writes", font=fsm, fill="#333333")
    save(img, "c4_level3_component.png")

# ---------------- LEVEL 4: CODE (optional) ----------------
def level4():
    W, H = 1560, 1040
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    fs = font(20, True); fh = font(16, True); fl = font(14); fsm = font(13)
    classes = [
        ("User", ["name, email, role", "teachSkills[], learnSkills[]", "credits, avgRating", "status, badges"]),
        ("SwapRequest", ["fromUser, toUser", "skillName, direction", "status (pending/…)", "creditsCost"]),
        ("Skill", ["name, category", "description", "createdAt"]),
        ("Session", ["requestId, date, time", "duration, mode (online/offline)", "meetingLink / location"]),
        ("Review", ["sessionId, reviewer", "rating (1–5), comment"]),
        ("Report", ["reporter, targetUser", "reason, resolved"]),
    ]
    cw, ch = 430, 260
    # row0: User, SwapRequest, Skill ; row1: Session, Review, Report
    pos = []
    for i, (name, fields) in enumerate(classes):
        col = i % 3; row = i // 3
        x = 90 + col * (cw + 45)
        y = 150 + row * (ch + 90)
        pos.append((x, y, name, fields))
    for (x, y, name, fields) in pos:
        box = (x, y, x + cw, y + ch)
        d.rounded_rectangle(box, radius=10, outline="#2f6fb0", width=3, fill="#eef5fc")
        d.rounded_rectangle((x, y, x + cw, y + 52), radius=10, fill="#438DD5", outline="#2f6fb0", width=2)
        d.rectangle((x, y + 30, x + cw, y + 52), fill="#438DD5")
        draw_text_block(d, x + cw/2, y + 26, [name], fh, C_WHITE)
        yy = y + 78
        for f in fields:
            draw_text_block(d, x + cw/2, yy, [f], fl, "#333333")
            yy += 42
    # edges (adjacent, orthogonal, no crossings)
    def e(p1, p2, label="", lpos=None):
        d.line([p1, p2], fill="#999999", width=3)
        if label:
            d.text(lpos or (p1[0] + 12, p1[1] + 6), label, font=fsm, fill="#555555")
    # 1. User (0) right -> SwapRequest (1) left   (horizontal, row0)
    (x0, y0, n0, _) = pos[0]; (x1, y1, n1, _) = pos[1]
    e((x0 + cw, y0 + ch/2), (x1, y1 + ch/2), "1  N", (x0 + cw + 20, y0 + ch/2 - 30))
    # 2. SwapRequest (1) right -> Skill (2) left  (horizontal, row0)
    (x2, y2, n2, _) = pos[2]
    e((x1 + cw, y1 + ch/2), (x2, y2 + ch/2), "1  N", (x1 + cw + 20, y1 + ch/2 - 30))
    # 3. User (0) bottom -> Session (3) top       (vertical, col0)
    (x3, y3, n3, _) = pos[3]
    e((x0 + cw/2, y0 + ch), (x3 + cw/2, y3), "1  N", (x0 + cw/2 + 12, y0 + ch + 14))
    # 4. Session (3) right -> Review (4) left     (horizontal, row1)
    (x4, y4, n4, _) = pos[4]
    e((x3 + cw, y3 + ch/2), (x4, y4 + ch/2), "1  N", (x3 + cw + 20, y3 + ch/2 - 30))
    # 5. Review (4) right -> Report (5) left      (horizontal, row1)
    (x5, y5, n5, _) = pos[5]
    e((x4 + cw, y4 + ch/2), (x5, y5 + ch/2), "", None)
    save(img, "c4_level4_code.png")

level1()
level2()
level3()
level4()
print("done")
