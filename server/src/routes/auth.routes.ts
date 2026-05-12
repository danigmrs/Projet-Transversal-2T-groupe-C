import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import Utilisateur from "../models/user";

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: API d'authentification
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: john
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: L'utilisateur existe déjà
 */
router.post("/register", AuthController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur et création du cookie JWT
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: john
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants invalides
 */
router.post("/login", AuthController.login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Récupérer l'utilisateur actuellement connecté
 *     description: Retourne les informations complètes de l'utilisateur authentifié via le token JWT (cookie).
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur authentifié récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_user:
 *                   type: integer
 *                   example: 1
 *                 nom_user:
 *                   type: string
 *                   example: Doe
 *                 prenom_user:
 *                   type: string
 *                   example: John
 *                 mail_user:
 *                   type: string
 *                   example: john@demo.com
 *       401:
 *         description: Non autorisé - token manquant ou invalide
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get("/me", authMiddleware, async (req, res) => {
  const user = await Utilisateur.findByPk((req as any).user.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Déconnexion utilisateur et suppression du cookie
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post("/logout", authMiddleware, (req, res) => {

  res.clearCookie("token");

  res.json({
    message: "Logout successful",
  });
});

export default router;