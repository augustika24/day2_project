import { parse } from "dotenv";
import {
  readProductsFromFile,
  sendResponse,
} from "../../utils/products/index.js";

export const handleProductRoutes = (req, res) => {
  const parsedUrl = new URL(req.url, process.env.BASE_URL);

  const pathname = parsedUrl.pathname;
  const id = parsedUrl.searchParams.get("id");

  //get prodicts
  if (pathname !== "/products") {
    return "false";
  }

  if (req.method === "GET") {
    const products = readProductsFromFile();

    if (id) {
      const product = products.find((u) => u.id === id);
      if (!product) {
        return sendResponse(res, 404, {
          error: "Product not found ",
        });
      }
      return sendResponse(res, 200, { data: product });
    }

    const page = Number(parsedUrl.searchParams.get("page")) || 1;
    const limit = Number(parsedUrl.searchParams.get("limit")) || 10;
    const category = parsedUrl.searchParams.get("category");
    const brand = parsedUrl.searchParams.get("brand");
    const price = parsedUrl.searchParams.get("price");
    const search = parsedUrl.searchParams.get("search");
    const sort = parsedUrl.searchParams.get("sort");
    const order = parsedUrl.searchParams.get("order") || "asc";
   

    let result = [...products];


    if (category) {
      result = result.filter(
        (prod) => prod.category.toLowerCase() === category.toLowerCase(),
      );
    }
    //brand filter
    if (brand) {
      result = result.filter(
        (prod) => prod.brand.toLowerCase() === brand.toLowerCase(),
      );
    }

    const filterByCategory = category
      ? products.filter(
          (prod) =>
            prod.category.trim().toLowerCase() ===
            category.trim().toLowerCase(),
        )
      : products;
    const totalCategoryProductsList = filterByCategory.length;

    if (category) {
      if (!filterByCategory) {
        return sendResponse(res, 404, {
          error: "No Products found",
        });
      }
      return sendResponse(res, 200, {
        filterByCategory,
        page,
        limit,
        totalProducts: totalCategoryProductsList,
      });
    }

    //adding search by name ;

    if (search) {
      result = result.filter((product) => {
        return (
          product.name.includes(search) ||
          product.category.includes(search) ||
          product.brand.includes(search)
        );
      });
    }

    if (sort) {
      result.sort((a, b) => {
        let compar = 0;
        switch (sort) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;

          case "category":
            compar = a.price - b.price;
            break;

          case "rating":
            compar = a.rating - b.rating;
            break;

          case "createdAt":
            compar = new Date(a.createdAt) - new Date(b.createdAt);
            break;

          case "default":
            compar = 0;
        }
        return order === "desc" ? -compar : compar;
      });
    }

    const totalItems = result.length;
    const totalPages = Math.ceil(totalItems / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    result = result.slice(startIndex, endIndex);

    return sendResponse(res, 200, {
      success: true,

      data: result,

      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }
};
