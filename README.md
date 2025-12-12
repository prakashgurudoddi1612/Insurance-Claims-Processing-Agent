Here is a clean, professional **README.md** for your project based on the uploaded file **insurance_claims_agent.tsx**.
You can copy–paste this directly into your repository.

---

# 📄 Insurance Claims Processing Agent

### *Autonomous FNOL Document Analysis & Intelligent Claim Routing*

This project is a **React-based intelligent claims processing agent** that automatically extracts information from **FNOL (First Notice of Loss)** documents, identifies missing fields, detects potential fraud indicators, and recommends the correct routing path for insurance claim workflows.

The agent supports **TXT and PDF** file uploads, performs text parsing, and generates a structured JSON summary of extracted fields and routing decisions.

---

## 🚀 Features

### 🔍 **1. Automated Text Extraction**

* Reads uploaded FNOL documents (`.txt` or `.pdf`)
* Extracts key fields using rule-based regex patterns
  (Policy number, claimant details, incident information, asset details, etc.)

### 🧠 **2. Intelligent Field Parsing**

The agent parses:

* Policy Number
* Policyholder Name
* Incident Date & Time
* Loss Location
* Description of Accident
* Claimant / Driver Details
* Vehicle Make, Model, VIN
* Estimated Damage

### ⚠️ **3. Missing Field Detection**

Automatically identifies and lists required fields that are missing for claim validation.

### 🛡️ **4. Fraud Indicator Detection**

Flags suspicious claims by scanning for keywords such as:

* fraud
* staged
* false
* suspicious

### 🏥 **5. Injury Detection**

Routes claims to specialist queues if injury-related keywords are found:

* injury
* medical
* ambulance
* hospital

### 🛣️ **6. Automatic Claim Routing**

Based on extracted data, the system routes claims to:

* **Fast-track**
* **Manual Review**
* **Investigation Queue**
* **Specialist Queue**
* **Standard Processing**

### 🧾 **7. JSON Output Summary**

A structured JSON view is displayed, containing:

* Extracted fields
* Missing fields
* Recommended routing
* Reasoning

---

## 🧰 Tech Stack

| Component    | Used                                   |
| ------------ | -------------------------------------- |
| Frontend     | React + TypeScript                     |
| UI Icons     | Lucide-React                           |
| Styling      | TailwindCSS                            |
| File Parsing | FileReader API (text-based extraction) |

---

## 📁 File Structure

```
/src
 └── components
     └── insurance_claims_agent.tsx   # Main processing UI & logic
```

---

## ▶️ How It Works (Flow)

1. **User uploads FNOL doc**
2. **System extracts raw text**
3. **Regex-based parser extracts structured fields**
4. **Missing mandatory fields identified**
5. **Fraud & injury indicators scanned**
6. **Claim is auto-routed**
7. **UI displays extracted info + routing + JSON**

---

## 📦 Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone <your-repo-url>
cd your-repo
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Start development server

```bash
npm start
```

The app will run on:
👉 `http://localhost:3000/`

---

## 🖥️ UI Overview

The interface includes:

* FNOL Document Upload
* Process Button
* Routing Decision Card
* Missing Fields Display
* Extracted Information Grid
* JSON Output Block

---

## 🧪 Supported File Formats

| Format | Supported                                       |
| ------ | ----------------------------------------------- |
| .txt   | ✔️ Fully supported                              |
| .pdf   | ⚠️ Must be text-extractable (no scanned images) |

---

## 🛠️ Future Enhancements

* OCR support for scanned PDFs
* ML/NLP based entity extraction
* Integration with real claim databases
* Workflow automation APIs

---


