import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Users
 *   description: API de gestion des utilisateurs
 */

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lastname
 *               - firstname
 *               - mail
 *               - password
 *             properties:
 *               lastname:
 *                 type: string
 *                 example: Doe
 *               firstname:
 *                 type: string
 *                 example: John
 *               mail:
 *                 type: string
 *                 example: john@demo.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Champs manquants
 */
router.post("/", userController.createUser);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     tags:
 *       - Users
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       401:
 *         description: Non autorisé
 */
router.get("/", authMiddleware, userController.getUsers);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     tags:
 *       - Users
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur non trouvé
 *       401:
 *         description: Non autorisé
 */
router.get("/:id", authMiddleware, userController.getUserById);

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     tags:
 *       - Users
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lastname:
 *                 type: string
 *               firstname:
 *                 type: string
 *               mail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 */
router.put("/:id", authMiddleware, userController.updateUser);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags:
 *       - Users
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 */
router.delete("/:id", authMiddleware, userController.deleteUser);

export default router;
