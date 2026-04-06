const express = require("express");
const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");
const { signToken } = require("../utils/token");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    if (!["cliente", "productor"].includes(role)) {
      return res.status(400).json({ message: "Rol inválido." });
    }

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ message: "El correo ya está registrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from("users")
      .insert({ name, email: email.toLowerCase(), password: hashedPassword, role })
      .select("id, name, email, role")
      .single();

    if (error) {
      return res.status(500).json({ message: "Error al registrar usuario." });
    }

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al registrar usuario." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Correo y contraseña requeridos." });
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, name, email, password, role")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error en login." });
  }
});

module.exports = router;
