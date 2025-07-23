#  DeployX — GitHub Repo to Cloudflare Deployment Pipeline

**DeployX** is a lightweight system that takes a public GitHub repository, assigns it an ID, and fully automates the deployment process using **Cloudflare R2** and **Redis**. It lets users deploy and run code without needing to clone or build anything manually.

---

## 🛠️ What It Does (In Simple Terms)

1. **User submits a GitHub repo URL** they want to deploy.
2. **We assign it a unique ID** and download the code locally.
3. The repo is **uploaded to Cloudflare R2** (like cloud storage).
4. The **ID is pushed to a Redis queue** for processing.
5. The **deployment service picks it up**, downloads it from Cloudflare again, builds it locally, and uploads the built version back to Cloudflare.
6. The **user can now access the deployed project** via a simple link.

---

## ⚙️ Technologies Used

- **Redis** – Task queue for tracking deployment jobs  
- **Cloudflare R2** – Object storage for repo files and builds  
- **Node.js / Express (or your stack)** – For the deployment and queue processing logic  
- **Git** – For downloading GitHub repos  
- **Shell/CLI** – For building projects locally

---

## 🧪 How to Test

You can simulate this locally in 2 parts:

1. **Submit a repo**  
   → Get an ID and upload source code to Cloudflare

2. **Deploy the repo**  
   → Watch the deployment service pull the ID from Redis and build it

---
