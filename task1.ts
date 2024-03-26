import express from "express";
import { v4 as uuidv4 } from "uuid";

interface User {
  id: string;
  sessionIds: string[];
  active_user: boolean;
}

const app = express();
const PORT = 3000;

// this is or will be the database connected
const users: { [key: string]: User } = {};

app.use(express.json());
const checkSession = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const userId = req.headers["user-id"] as string;
  const sessionId = req.headers["session-id"] as string;

  if (!userId || !sessionId) {
    return res.status(401).json({ message: "User ID or Session ID missing" });
  }

  let user = users[userId];

  if (!user) {
    user = { id: userId, sessionIds: [], active_user: false };
    users[userId] = user;
  }

  if (!user.sessionIds.includes(sessionId)) {
    user.sessionIds.push(sessionId);
  }

  next();
};

/**
 * Endpoint for user login
 * @param req - Express request object
 * @param res - Express response object
 */
app.post("/login", (req: express.Request, res: express.Response) => {
  // Extract user ID and generate a session ID
  const userId = req.body.userId as string;
  const sessionId = uuidv4();

  // Check if user ID is provided
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  // Create user object with user ID, session ID, and set user as inactive
  users[userId] = { id: userId, sessionIds: [sessionId], active_user: false };

  // Return session ID upon successful login
  res.status(200).json({ sessionId });
});


app.post(
  "/activity",
  checkSession,
  (req: express.Request, res: express.Response) => {
    const userId = req.headers["user-id"] as string;

    console.log(`User ${userId} is active`);

    res.status(200).json({ message: "Activity tracked" });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
