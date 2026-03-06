const express = require("express");
const cors = require("cors");
const { createClient } = require("redis");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

/* Redis Cloud Connection */
const redisClient = createClient({
    username: "default",
    password: "uu5aUCUWhJkvuJDtVCv0GPOxZaLfJSWu",
    socket: {
        host: "redis-16653.c9.us-east-1-2.ec2.cloud.redislabs.com",
        port: 16653
    }
});

redisClient.on("error", (err) => {
    console.log("Redis Client Error", err);
});

/* Connect Redis */
async function startServer() {

    await redisClient.connect();
    console.log("Connected to Redis Cloud");

    /* Seat Booking API */
    app.post("/book", async (req, res) => {

        const seat = req.body.seat;

        try {

            const lock = await redisClient.setNX(seat, "locked");

            if (lock) {

                await redisClient.expire(seat, 60);

                res.json({
                    message: "Seat booked successfully"
                });

            } else {

                res.json({
                    message: "Seat already booked"
                });

            }

        } catch (error) {

            res.json({
                message: "Booking error"
            });

        }

    });

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

}

startServer();