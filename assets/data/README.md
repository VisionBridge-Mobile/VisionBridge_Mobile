# VisionBridge Mobile: G.C.E. O/L ICT Comprehensive Question Bank

## 📘 Project Overview
This repository hosts the **Master Question Bank** for the VisionBridge Mobile learning platform. This dataset has been **manually created and structured** to provide exhaustive coverage of the **Sri Lankan G.C.E. Ordinary Level (O/L) ICT Syllabus** for Grades 10 and 11.

The content is designed to support the **Audio Quiz Engine** by providing high-quality, syllabus-accurate questions that directly address the Learning Outcomes specified by the National Institute of Education (NIE).

---

## 🎯 Syllabus Alignment & Domain Coverage
The question bank covers **100% of the Competency Levels** required for the O/L examination. Each question has been crafted to test specific knowledge points within the following domains:

### **Grade 10 Syllabus**

#### **1. Information & Communication Technology**
* **Scope:** The role of ICT in national development and the evolution of computing.
* **Key Topics:**
    * ICT Applications (E-Government, Tele-medicine, Smart Agriculture).
    * Evolution of Computers (Vacuum tubes to Microprocessors).
    * Data vs. Information distinction.

#### **2. Computer Hardware & Architecture**
* **Scope:** Identification and classification of computer systems and peripherals.
* **Key Topics:**
    * **Input Devices:** Classification and usage (OCR, MICR, Barcode Readers).
    * **Output Devices:** Display technologies (LED/LCD) and printing (Plotters).
    * **Connectivity:** Standard ports (HDMI, VGA, USB, RJ45).
    * **Architecture:** Von Neumann model components (ALU, CU, Registers).

#### **3. Data Representation**
* **Scope:** Mathematical foundations of digital data.
* **Key Topics:**
    * **Number Systems:** Conversions between Binary, Octal, Decimal, and Hexadecimal.
    * **Storage Hierarchy:** Units of measurement (Bit to Terabyte).
    * **Coding Standards:** ASCII, EBCDIC, and Unicode (Sinhala/Tamil support).

#### **4. Logic Gates & Digital Circuits**
* **Scope:** Boolean algebra and digital logic design.
* **Key Topics:**
    * Fundamental Gates: AND, OR, NOT.
    * Derived Gates: NAND, NOR.
    * Truth Table analysis and logic circuit construction.

#### **5. Operating Systems**
* **Scope:** System software functions and management.
* **Key Topics:**
    * **Core Functions:** Process, Memory, File, and Device Management.
    * **Classifications:** Multi-user, Real-time, Distributed OS.
    * **System Utilities:** Disk Defragmentation, Antivirus, Formatting.

#### **6. Database Management Systems (DBMS)**
* **Scope:** Theory and application of relational databases.
* **Key Topics:**
    * **Structure:** Field, Record, Table definitions.
    * **Relational Keys:** Primary Key and Foreign Key usage.
    * **Database Integrity:** Data Consistency, Redundancy reduction, and Security.

---

### **Grade 11 Syllabus**

#### **7. Programming (Pascal Focus)**
* **Scope:** Algorithmic problem solving and structured programming.
* **Key Topics:**
    * **Syntax:** Usage of reserved keywords (VAR, BEGIN, END, IF..THEN).
    * **Data Types:** Integer, Real, Boolean, Char, String handling.
    * **Operators:** Arithmetic (`DIV`, `MOD`), Relational, and Logical operators.
    * **Control Structures:** Sequence, Selection (`CASE`, `IF`), and Iteration (`FOR`, `WHILE`).

#### **8. Systems Development Life Cycle (SDLC)**
* **Scope:** Phases of software engineering and information systems.
* **Key Topics:**
    * **Stages:** Requirement Gathering, Design, Implementation, Testing, Deployment.
    * **Deployment Strategies:** Parallel running, Direct changeover, Phased implementation.

#### **9. Internet & Networking**
* **Scope:** Network infrastructure and communication protocols.
* **Key Topics:**
    * **Terminology:** IP Addresses, URLs, DNS, TCP/IP protocols.
    * **Architecture:** Client-Server models and Cloud Computing.
    * **Services:** WWW, Email protocols (SMTP), FTP, and Video Conferencing.

#### **10. Web Development**
* **Scope:** Website structure and authoring.
* **Key Topics:**
    * **HTML Standards:** Tag usage (`<html>`, `<body>`, `<table>`, `<a>`).
    * **Content Management:** Static vs. Dynamic pages, CMS tools (Joomla).

#### **11. ICT & Society**
* **Scope:** Legal, ethical, and health implications of technology.
* **Key Topics:**
    * **Legal Framework:** Computer Crimes Act No. 24 of 2007, Intellectual Property Act.
    * **Health & Safety:** Ergonomics, RSI, CVS, and E-Waste management.
    * **Cyber Security:** Protection against Phishing, Malware, and Software Piracy.

---

## 📂 Dataset Structure

The data is stored in the `assets/` directory and formatted as follows:

* **`large_lesson.json`**: The primary data file containing the structured question bank, used directly by the application.
* **`evaluation_dataset.csv`**: A tabular version of the question bank provided for external auditing, content verification, and syllabus coverage checks.

---

## ⚖️ Content Policy
This dataset was created ensuring strict adherence to the **National Institute of Education (NIE)** curriculum guidelines. All questions, distractors (wrong answers), and hints have been manually verified to ensure they are age-appropriate and contextually relevant for Sri Lankan O/L students.