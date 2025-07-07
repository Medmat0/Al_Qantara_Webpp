import {
  createCategorieService,
  getAllCategoriesService,
  getCategorieByIdService,
  updateCategorieService,
  deleteCategorieService
} from "../../services/article/categorieService.js";

/**
 * @desc    Créer une nouvelle catégorie
 * @method  POST
 * @route   /articles/categories
 */
const createCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;

    if (!nom) {
      return res.status(400).json({
        message: "Le nom de la catégorie est requis."
      });
    }

    const categorie = await createCategorieService({ nom, description });

    res.status(201).json({
      message: "Catégorie créée avec succès.",
      categorie
    });
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    res.status(500).json({
      message: error.message
    });
  }
};

/**
 * @desc    Récupérer toutes les catégories
 * @method  GET
 * @route   /articles/categories
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await getAllCategoriesService();
    
    if (!categories || categories.length === 0) {
      return res.status(200).json({
        message: "Aucune catégorie trouvée",
        categories: []
      });
    }

    res.status(200).json({
      message: "Catégories récupérées avec succès",
      categories
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des catégories",
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer une catégorie par son ID
 * @method  GET
 * @route   /articles/categories/:id
 */
const getCategorieById = async (req, res) => {
  try {
    const { id } = req.params;
    const categorie = await getCategorieByIdService(parseInt(id));
    res.status(200).json(categorie);
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie:", error);
    res.status(500).json({
      message: error.message
    });
  }
};

/**
 * @desc    Mettre à jour une catégorie
 * @method  PUT
 * @route   /articles/categories/:id
 */
const updateCategorie = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description } = req.body;

    if (!nom) {
      return res.status(400).json({
        message: "Le nom de la catégorie est requis."
      });
    }

    const categorie = await updateCategorieService(parseInt(id), { nom, description });

    res.status(200).json({
      message: "Catégorie mise à jour avec succès.",
      categorie
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error);
    res.status(500).json({
      message: error.message
    });
  }
};

/**
 * @desc    Supprimer une catégorie
 * @method  DELETE
 * @route   /articles/categories/:id
 */
const deleteCategorie = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteCategorieService(parseInt(id));
    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    res.status(500).json({
      message: error.message
    });
  }
};

export {
  createCategorie,
  getAllCategories,
  getCategorieById,
  updateCategorie,
  deleteCategorie
}; 