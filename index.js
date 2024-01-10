import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  console.log("fooooo");
  res.status(200).send("Hello Worldd!");
});

/**
 * Facebook app: https://developers.facebook.com/apps/1031001137977295/messenger/messenger_api_settings/
 */

/* For Facebook Validation */
app.get("/webhook", (req, res) => {
  console.log(req.query);
  if (
    req.query["hub.mode"] &&
    req.query["hub.verify_token"] === "tuxedo_bilai"
  ) {
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    res.status(403).end();
  }
});

/* Handling all messenges */
app.post("/webhook", (req, res) => {
  console.log(req.body);
  if (req.body.object === "page") {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          sendMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});

async function sendMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
      {
        method: "POST",
        body: JSON.stringify({
          recipient: { id: sender },
          message: { text: `You said "${text}"` },
        }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}

const server = app.listen(process.env.PORT || 5000, () => {
  console.log(
    "Express server listening on port %d in %s mode",
    server.address().port,
    app.settings.env
  );
});
