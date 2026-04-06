const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Token requerido." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("id", payload.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Usuario no válido." });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "No autorizado." });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "No tienes permisos para esta acción." });
  }
  next();
};

module.exports = { auth, authorize };
