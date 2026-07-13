import { error } from "console";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readUsersFromFile, sendResponse, writeUsersToFile } from "../../utils/users/index.js";
import { validateUser } from "../../validations/userValidations.js";



export const handleUserRoutes = (req, res) => {
  const parsedUrl = new URL(req.url, process.env.BASE_URL);
  const pathname = parsedUrl.pathname;
  const id = parsedUrl.searchParams.get("id");

  if (pathname !== "/users") {
    return false;
  }



  if (req.method === "GET") {
    const users = readUsersFromFile();

    const page = Number(parsedUrl.searchParams.get("page"))||1;
    const limit = Number(parsedUrl.searchParams.get("limit"))||10;
    const startIndex = (page-1)*limit;
    const endIndex = startIndex+limit;
    const hasNextPage = endIndex<users.length ;
    const hasPrevPage = startIndex>0;
    const totalPages = Math.ceil(users.length / limit);


    if(id){
      const user = users.find((u)=>u.id===id);
      if(!user){
        return sendResponse(res,404,{
          error:"User does not exist"
        })
      }
      return sendResponse(
        res,200,user
      )
    }
console.log(users.length,"---user length");


const paginatedUserList = users.slice(startIndex,endIndex);
console.log(paginatedUserList,"'----paginatinatyed user list")

    return sendResponse(res, 200, {
      message: "Users fetched successfully",
      users : paginatedUserList,
      totalUsers : users.length,
      page,
      totalPages,
      limit,
      hasNextPage,
      hasPrevPage
    });
  }



  if (req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const parsedData = JSON.parse(body);

        const validationError = validateUser(parsedData);

        if (validationError) {
          return sendResponse(res, 400, {
            error: validationError,
          });
        }

        const users = readUsersFromFile();

        const newUser = {
          id: randomUUID(),
          name: parsedData.name,
          email: parsedData.email,
        };

        users.push(newUser);

        writeUsersToFile(users);

        return sendResponse(res, 201, {
          message: "User created successfully",
          user: newUser,
        });
      } catch (err) {
        return sendResponse(res, 400, {
          error: "Invalid JSON format.",
        });
      }
    });

    return;
  }


  if (req.method === "PUT") {
    if (!id) {
      return sendResponse(res, 400, {
        error: "User id is required.",
      });
    }

    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const parsedData = JSON.parse(body);

        const validationError = validateUser(parsedData);

        if (validationError) {
          return sendResponse(res, 400, {
            error: validationError,
          });
        }

        const users = readUsersFromFile();

        const userIndex = users.findIndex((user) => user.id === id);

        if (userIndex === -1) {
          return sendResponse(res, 404, {
            error: "User not found.",
          });
        }

        users[userIndex] = {
          ...users[userIndex],
          name: parsedData.name,
          email: parsedData.email,
        };

        writeUsersToFile(users);

        return sendResponse(res, 200, {
          message: "User updated successfully",
          user: users[userIndex],
        });
      } catch (err) {
        return sendResponse(res, 400, {
          error: "Invalid JSON format.",
        });
      }
    });

    return;
  }


  if (req.method === "DELETE") {
    if (!id) {
      return sendResponse(res, 400, {
        error: "User id is required.",
      });
    }

    const users = readUsersFromFile();

    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return sendResponse(res, 404, {
        error: "User not found.",
      });
    }

    const deletedUser = users[userIndex];

    users.splice(userIndex, 1);
    console.log(users,"---users after deletion ")

    writeUsersToFile(users);

    return sendResponse(res, 200, {
      message: "User deleted successfully",
      user: deletedUser,
    });
  }


  return sendResponse(res, 405, {
    error: "Method Not Allowed",
  });
};