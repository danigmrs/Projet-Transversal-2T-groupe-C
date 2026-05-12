import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

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
 *     summary: Récupérer l'utilisateur actuellement authentifié
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur authentifié actuel
 *       401:
 *         description: Non autorisé
 */
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    user: (req as any).user,
  });
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