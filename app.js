require("dotenv").config();

const axios = require("axios").default;

const instaApi = axios.create();
instaApi.defaults.baseURL = "https://graph.facebook.com/v14.0";

function getLongAccessToken(shortAccessToken) {
  instaApi
    .get(`/oauth/access_token`, {
      params: {
        grant_type: "fb_exchange_token",
        client_id: process.env.APP_ID,
        client_secret: process.env.APP_SECRET,
        fb_exchange_token: shortAccessToken,
      },
    })
    .then((res) => console.log(res.data));
}

function createPost(image_url, caption) {
  instaApi
    .post(
      `/17841454448356423/media`,
      {},
      {
        params: {
          fields: "id",
          caption,
          image_url,
          access_token: process.env.LONG_ACCESS_TOKEN,
        },
      }
    )
    .then(({ data }) => {
      instaApi.post(
        `17841454448356423/media_publish`,
        {},
        {
          params: {
            creation_id: data.id,
            access_token: process.env.LONG_ACCESS_TOKEN,
          },
        }
      );
    })
    .catch((err) => {
      console.log("error: ", err);
    });
}

createPost(
  "https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F13%2F2015%2F04%2F05%2Ffeatured.jpg&q=60",
  "~posted via code"
);
