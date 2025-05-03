
# ✈️ FAA Handbook URL Reference Guide (Validated)

This document provides direct links and URL construction patterns for major FAA handbooks and documents used in flight training, along with guidance on linking to specific chapters or pages. ⚠️ Always double-check the URLs for availability and correctness, as file paths may change on the FAA's servers.

---

## ✅ Airplane Flying Handbook (AFH) – FAA-H-8083-3C
- **Base URL:**  
  `https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/airplane_handbook`
- **Full PDF:**  
  [AFH Full PDF](https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/airplane_handbook/airplane_flying_handbook.pdf)
- **Chapter Example – Chapter 4 (Energy Management: Mastering Altitude and Airspeed Control):**  
  [Chapter 4 PDF](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/05_afh_ch4.pdf)

---

## ✅ Pilot’s Handbook of Aeronautical Knowledge (PHAK) – FAA-H-8083-25C
- **Base URL:**  
  `https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak`
- **Full PDF:**  
  [PHAK Full PDF](https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak/pilot_handbook.pdf)
- **Chapter Example – Chapter 8 (Flight Instruments):**  
  [PHAK Chapter 8](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/phak/10_phak_ch8.pdf)

- **URL Construction:**  
  To access a specific chapter, use the format:  
  `https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/phak/XX_phak_chY.pdf`  
  Replace XX with the chapter number (e.g., 10 for Chapter 8) and Y with the chapter number (e.g., 8).

---

## ✅ Instrument Flying Handbook (IFH) – FAA-H-8083-15B
- **Base URL:**  
  `https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/ifh`
- **Full PDF:**  
  [IFH Full PDF](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/ifh/instrument_flying_handbook.pdf)
- **Chapter Example – Chapter 11 (IFR Emergencies):**  
  ✅ *No separate chapter PDF available* — use the full handbook and navigate to the chapter manually.

- **URL Construction:**  
  For the full handbook, use the provided full PDF link. Individual chapters are not available separately.

---

## ✅ Aviation Weather Handbook (AWH) – FAA-H-8083-28A
- **Base URL:**  
  `https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/awh`
- **Full PDF:**  
  [AWH Full PDF](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/awh/FAA-H-8083-28A.pdf)
- **Chapter Example – Chapter 2 (The Atmosphere):**  
  ✅ *No separate chapter PDF available* — use the full handbook and navigate to the chapter manually.

- **URL Construction:**  
  For the full handbook, use the provided full PDF link. Individual chapters are not available separately.

---

## ✅ Aviation Instructor’s Handbook (AIH) – FAA-H-8083-9B
- **Base URL:**  
  `https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/aviation_instructors_handbook`
- **Full PDF:**  
  [AIH Full PDF](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/aviation_instructors_handbook/aviation_instructors_handbook.pdf)
- **Chapter Example – Chapter 4 (Effective Communication):**  
  [AIH Chapter 4](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/aviation_instructors_handbook/06_aih_chapter_4.pdf)

- **URL Construction:**  
  To access a specific chapter, use the format:  
  `https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/aviation_instructors_handbook/XX_aih_chapter_Y.pdf`  
  Replace XX with the chapter number plus 2 (e.g., 06 for Chapter 4) and Y with the chapter number (e.g., 4).

---

## ✅ Airman Certification Standards (ACS)
- **Base URL:**  
  `https://www.faa.gov/training_testing/testing/acs`
- **Example – Private Pilot Airplane ACS:**  
  [Private Pilot ACS](https://www.faa.gov/sites/faa.gov/files/training_testing/testing/acs/private_airplane_acs.pdf)

- **URL Construction:**  
  For specific ACS documents, use the base URL and navigate to the desired certification standard.

---

## ✅ FAA Regulations (eCFR)
- **Live Title 14 Access (Aeronautics and Space):**  
  [eCFR Title 14](https://www.ecfr.gov/current/title-14)
- **Example – Part 91.213 (Inoperative Instruments and Equipment):**  
  [14 CFR §91.213](https://www.ecfr.gov/current/title-14/part-91/section-91.213)

---

## 🛠️ URL Construction Instructions

To programmatically construct FAA handbook chapter links:

1. Use the correct **base URL** from above.
2. Add the chapter file path:
   - Format: `XX_<doccode>_chYY.pdf`
     - `XX` = 2-digit chapter prefix
     - `<doccode>` = `afh`, `phak`, `ifh`, `aih`, etc.
     - `YY` = numeric chapter (e.g., `ch4` becomes `04_aih_chapter_4.pdf`)
3. Append `#page=N` at the end of a URL to **suggest a page scroll** (browser-dependent).

> ⚠️ Not all handbooks have individually hosted chapter PDFs. In those cases, reference the full PDF and give instructions to navigate by chapter or page.

---

