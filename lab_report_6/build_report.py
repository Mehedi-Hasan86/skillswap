#!/usr/bin/env python3
# Build Lab Report 6 (System Architecture and Deployment Strategies) DOCX for SkillSwap.
import os
from docx import Document
from docx.shared import Pt, Mm, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION, WD_ORIENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

OUT = "/mnt/d/iiuc/semester_06/cse_3638_software_engineering_lab/skillswap/lab_report_6"
FIG = OUT

PRIMARY = RGBColor(0x11, 0x68, 0xBD)
DARK    = RGBColor(0x1F, 0x4E, 0x79)
GREY    = RGBColor(0x60, 0x60, 0x60)

doc = Document()

# ---- base styles ----
normal = doc.styles["Normal"]
normal.font.name = "Calibri"
normal.font.size = Pt(11)
normal.paragraph_format.space_after = Pt(6)

for h, sz in (("Heading 1", 16), ("Heading 2", 13), ("Heading 3", 12)):
    st = doc.styles[h]
    st.font.name = "Calibri"
    st.font.size = Pt(sz)
    st.font.color.rgb = DARK
    st.font.bold = True

def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hexcolor)
    tcPr.append(shd)

def set_cell(cell, text, bold=False, size=9, color=None, align="left"):
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = {"left": WD_ALIGN_PARAGRAPH.LEFT, "center": WD_ALIGN_PARAGRAPH.CENTER,
                   "just": WD_ALIGN_PARAGRAPH.JUSTIFY}[align]
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(text)
    run.bold = bold
    run.font.size = Pt(size)
    if color:
        run.font.color.rgb = color

def caption(text, num_prefix=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(14)
    r = p.add_run(text)
    r.italic = True
    r.font.size = Pt(8.5)
    r.font.color.rgb = GREY
    return p

def para(text, size=11, bold=False, italic=False, align="just", space_after=6, color=None):
    p = doc.add_paragraph()
    p.alignment = {"just": WD_ALIGN_PARAGRAPH.JUSTIFY, "left": WD_ALIGN_PARAGRAPH.LEFT,
                   "center": WD_ALIGN_PARAGRAPH.CENTER}[align]
    p.paragraph_format.space_after = Pt(space_after)
    r = p.add_run(text)
    r.bold = bold
    r.italic = italic
    r.font.size = Pt(size)
    if color:
        r.font.color.rgb = color
    return p

def heading(text, level=1):
    h = doc.add_heading(text, level=level)
    return h

def bullet(text, size=11):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run(text)
    r.font.size = Pt(size)
    return p

def figure(path, width_mm, cap):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run()
    run.add_picture(path, width=Mm(width_mm))
    caption(cap)

# ================= COVER PAGE =================
para("International Islamic University Chittagong", size=16, bold=True, align="center", space_after=2, color=PRIMARY)
para("Department of Computer Science and Engineering", size=12, align="center", space_after=2)
para("CSE 3638 — Software Engineering Lab", size=12, align="center", space_after=24)

para("LAB REPORT 6", size=22, bold=True, align="center", space_after=4, color=DARK)
para("System Architecture and Deployment Strategies", size=16, bold=True, align="center", space_after=6, color=DARK)
para("Project: SkillSwap — Trade Skills, Not Money", size=13, italic=True, align="center", space_after=30)

para("Team CodeXchange", size=13, bold=True, align="center", space_after=2)
para("Course Instructor: Software Engineering Lab", size=11, align="center", space_after=2)
para("Date: November 2026", size=11, align="center", space_after=24)

para("Submitted in partial fulfilment of the requirements of the course "
     "CSE 3638 Software Engineering Lab.", size=10, italic=True, align="center", color=GREY)

doc.add_page_break()

# ================= OBJECTIVE =================
heading("1. Objective", 1)
para("The objective of this lab report is to explore, compare, and represent different software "
     "architecture styles — Monolithic, Microservices, Serverless, and Event-Driven — and to model "
     "the selected project's architecture (SkillSwap) using the C4 model.")

# ================= TASK 1 =================
heading("2. Task 1 — Compare Different Architectures", 1)
para("Software architecture determines how a system is decomposed into units, how those units "
     "communicate, and how the whole is deployed. The four styles below differ chiefly in the "
     "granularity of deployment and the pattern of communication, which in turn shape scalability, "
     "maintainability and operational complexity.")

# Comparison table needs a landscape section
sec = doc.add_section(WD_SECTION.NEW_PAGE)
sec.orientation = WD_ORIENT.LANDSCAPE
sec.page_width, sec.page_height = Mm(297), Mm(210)
sec.top_margin = sec.bottom_margin = Mm(15)
sec.left_margin = sec.right_margin = Mm(15)

para("Table 1 — Comparison of the four architecture styles across six aspects.",
     size=10, bold=True, align="left", space_after=8, color=DARK)

aspects = [
    ("Structure & modularity",
     "Single deployable unit; modules layered in-process (routes, services, models)",
     "Small independent services, each owning a bounded domain and its own data",
     "Functions (FaaS) deployed per operation; stateless, event-driven triggers",
     "Producers and consumers decoupled by an event broker; no direct calls"),
    ("Scalability",
     "Vertical only — scale the whole application as one unit",
     "Horizontal, per-service scaling based on load",
     "Automatic, per-invocation scaling (often to zero)",
     "Asynchronous; scales with event volume via broker partitioning"),
    ("Trade-offs",
     "Simple, fast to build and debug; harder to scale or partially modify",
     "High operational complexity: distributed data, service discovery, tracing",
     "Cold starts, vendor lock-in, harder local debugging and testing",
     "Eventual consistency; complex tracing and ordering guarantees"),
    ("Deployment & maintenance",
     "One build artefact, one deployment; easy CI/CD and rollback",
     "Independent CI/CD pipeline and deploy per service",
     "Vendor-managed infrastructure; no servers to patch",
     "Requires a persistent message broker to be provisioned and monitored"),
    ("Communication pattern",
     "In-process synchronous function calls",
     "Synchronous HTTP/REST or gRPC between services",
     "Synchronous HTTP invocation per function",
     "Asynchronous publish/subscribe of events"),
    ("Example use cases",
     "Campus portals, CRUD apps, MVPs, course projects",
     "Large e-commerce, streaming, high-traffic SaaS",
     "Image resizing, webhooks, batch jobs, spiky workloads",
     "IoT telemetry, notifications, order processing"),
]

headers = ["Aspect", "Monolithic", "Microservices", "Serverless", "Event-Driven"]
tbl = doc.add_table(rows=1, cols=5)
tbl.style = "Table Grid"
tbl.alignment = WD_TABLE_ALIGNMENT.CENTER

# header row
hdr = tbl.rows[0].cells
for i, h in enumerate(headers):
    set_cell(hdr[i], h, bold=True, size=9.5, align="center")
    shade(hdr[i], "1168BD")
    for p in hdr[i].paragraphs:
        for r in p.runs:
            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

# body
for aspect, *vals in aspects:
    row = tbl.add_row().cells
    set_cell(row[0], aspect, bold=True, size=9, color=DARK)
    shade(row[0], "DEEBF7")
    for j, v in enumerate(vals, start=1):
        set_cell(row[j], v, size=9)

# column widths (total 267mm usable in landscape)
widths = [30, 62, 57, 58, 60]
for row in tbl.rows:
    for i, w in enumerate(widths):
        row.cells[i].width = Mm(w)

para("Key observations: Monolithic and Microservices are both request/response styles, but differ in "
     "deployment granularity; Serverless removes server management at the cost of cold-start latency and "
     "vendor coupling; Event-Driven inverts the call direction by exchanging messages asynchronously, which "
     "maximises decoupling but adds eventual consistency. For a small, student-built platform with a single "
     "team and a short development window, the monolithic style offers the best fit.", size=10, align="just")

# ================= TASK 2 (back to portrait) =================
sec2 = doc.add_section(WD_SECTION.NEW_PAGE)
sec2.orientation = WD_ORIENT.PORTRAIT
sec2.page_width, sec2.page_height = Mm(210), Mm(297)
sec2.top_margin = sec2.bottom_margin = Mm(20)
sec2.left_margin = sec2.right_margin = Mm(20)

heading("3. Task 2 — Identify the Architecture Type", 1)
heading("3.1 Chosen Architecture: Monolithic", 2)
para("The SkillSwap platform uses a Monolithic Architecture: all features — user management, skill "
     "profiles, the matching engine, swap requests, session scheduling, reviews, credit economy and "
     "admin moderation — are implemented inside a single Express 5 application and deployed as one unit, "
     "alongside a single React 19 single-page frontend served separately.")

heading("3.2 Key Characteristics of the Chosen Architecture", 2)
bullet("Single deployable unit — one Node.js/Express process exposes every API endpoint under /api; "
       "the frontend is one Vite build.")
bullet("Layered in-process modularity — route handlers (routes/), cross-cutting middleware (middleware/), "
       "business logic (utils/), and data models (models/) all run inside the same process and call each "
       "other directly.")
bullet("Synchronous communication — the matching engine (utils/match.js) is invoked directly by the "
       "request handlers; no network hops between modules.")
bullet("Centralised data store — one Mongoose connection to MongoDB (with a built-in in-memory fallback "
       "store), shared by all modules.")
bullet("Single authentication boundary — JWT verification and role-based access control are enforced in "
       "one middleware layer.")

heading("3.3 Justification", 2)
para("Monolithic architecture suits SkillSwap's requirements for the following reasons:")
bullet("Scalability of scope, not load: the platform serves a campus-sized user base (hundreds of users), "
       "not a high-traffic global audience. A single process easily handles this load; splitting it into "
       "microservices would add operational overhead without a matching benefit.")
bullet("Performance: all modules share one process, so the matching algorithm and credit updates run "
       "in-process with no inter-service latency. This keeps the user experience snappy for a system whose "
       "core operation — computing 100-point match scores — is CPU-light.")
bullet("Maintainability: the layered structure (routes → middleware → utils → models) is easy to navigate "
       "and test for a small team. There is no distributed-data complexity, service discovery, or tracing "
       "to maintain, so new team members can onboard quickly.")
bullet("Deployment simplicity: one server build and one frontend build. The zero-config in-memory fallback "
       "means evaluators can run the whole system without provisioning a database — a decisive advantage "
       "for a course project.")
bullet("Trade-off accepted: vertical scaling only. If the user base grew dramatically, the matching engine "
       "could be extracted into a dedicated service (a first step toward microservices). For the current "
       "scope, the simplicity win outweighs that risk.")

# ================= TASK 3 =================
heading("4. Task 3 — C4 Model Diagrams", 1)
para("The C4 model describes a system at four levels of zoom. The diagrams below use the standard C4 "
     "notation: blue for the system in focus, grey for external systems, and stick figures for actors.")

heading("4.1 Level 1 — Context Diagram", 2)
para("The context diagram shows SkillSwap as a single software system and the actors and external systems "
     "it interacts with. Students (as teachers and learners) and Administrators use the platform; it relies "
     "on Google Identity for OAuth sign-in and on MongoDB for persistence.")
figure(os.path.join(FIG, "c4_level1_context.png"), 150, "Figure 1 — C4 Level 1 context diagram: SkillSwap and its external actors and systems.")

heading("4.2 Level 2 — Container Diagram", 2)
para("Zooming in, the system decomposes into containers: a React single-page app running in the browser, "
     "the Express REST API running on Node.js, and a MongoDB container (with an in-memory fallback store). "
     "Firebase Auth is shown as the external identity service.")
figure(os.path.join(FIG, "c4_level2_container.png"), 150, "Figure 2 — C4 Level 2 container diagram: web app, API, database and external auth.")

heading("4.3 Level 3 — Component Diagram", 2)
para("The Express API container is broken into its internal components: route handlers, middleware (JWT "
     "auth guard and admin guard), business logic (matching engine, credit economy, reputation), the data "
     "access layer (six Mongoose models), and configuration.")
figure(os.path.join(FIG, "c4_level3_component.png"), 160, "Figure 3 — C4 Level 3 component diagram: internal components of the Express API container.")

heading("4.4 Level 4 — Code (Class) Diagram", 2)
para("The code-level view shows the domain model classes — User, SwapRequest, Skill, Session, Review and "
     "Report — and their relationships, which map directly to the Mongoose schemas.")
figure(os.path.join(FIG, "c4_level4_code.png"), 160, "Figure 4 — C4 Level 4 code diagram: domain model classes and their relationships.")

# ================= TASK 4 =================
heading("5. Task 4 — Reflection", 1)
para("Comparing the four architecture styles made it clear that an architecture choice is a trade-off, "
     "not an absolute ranking: monolithic maximises simplicity and speed of delivery, microservices buy "
     "horizontal scalability at the cost of operational complexity, serverless removes infrastructure "
     "management but introduces cold starts and vendor coupling, and event-driven maximises decoupling "
     "while accepting eventual consistency. This exercise deepened my understanding that scalability is "
     "not a single axis — a system can scale vertically, horizontally, or by demand, and each style "
     "optimises a different one. Maintainability, likewise, is not automatic: the monolithic style keeps a "
     "small codebase navigable, but a large one would need disciplined layering and module boundaries to "
     "avoid becoming a tangle of dependencies. Finally, the C4 model proved a powerful communication tool: "
     "by zooming from context to containers to components to code, it lets a reader understand the system "
     "at the right level of detail without being overwhelmed, and it made the boundaries between the "
     "frontend, API, business logic and data layers immediately visible.")

doc.save(os.path.join(OUT, "Lab_Report_6_System_Architecture_and_Deployment_Strategies.docx"))
print("saved", os.path.join(OUT, "Lab_Report_6_System_Architecture_and_Deployment_Strategies.docx"))
