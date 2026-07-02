// Backend بسيط يستخدم Mail.tm API (مجاني) لإنشاء إيميلات مؤقتة حقيقية
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const MAILTM = "https://api.mail.tm";

// 1) إنشاء إيميل مؤقت جديد
app.post("/api/create", async (req, res) => {
  try {
    const domainRes = await axios.get(`${MAILTM}/domains`);
    const domain = domainRes.data["hydra:member"][0].domain;

    const username = "user" + Date.now();
    const password = "Pass" + Math.random().toString(36).slice(2) + "!1";
    const address = `${username}@${domain}`;

    await axios.post(`${MAILTM}/accounts`, { address, password });

    const tokenRes = await axios.post(`${MAILTM}/token`, { address, password });

    res.json({ address, password, token: tokenRes.data.token });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "فشل إنشاء الإيميل" });
  }
});

// 2) جلب الرسائل الواردة
app.get("/api/messages", async (req, res) => {
  try {
    const token = req.headers.authorization;
    const result = await axios.get(`${MAILTM}/messages`, {
      headers: { Authorization: token },
    });
    res.json(result.data["hydra:member"]);
  } catch (err) {
    res.status(500).json({ error: "فشل جلب الرسائل" });
  }
});

// 3) جلب محتوى رسالة معينة
app.get("/api/messages/:id", async (req, res) => {
  try {
    const token = req.headers.authorization;
    const result = await axios.get(`${MAILTM}/messages/${req.params.id}`, {
      headers: { Authorization: token },
    });
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: "فشل جلب الرسالة" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
