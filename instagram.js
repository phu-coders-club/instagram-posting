import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

//Creates base instagram api axios instance
const instaApi = axios.create();
instaApi.defaults.baseURL = "https://graph.facebook.com/v14.0";

//Uses a short-term (1 hour) api user access token to get a long-term (60 days) user access token
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

//Posts image from hosted url with caption to instagram
function createPost(image_urls, caption) {
  //Determines whether post is carousel
  const isCarousel = image_urls instanceof Array;
  const MEDIA_TYPES = {
    IMAGE: "IMAGE",
    VIDEO: "VIDEO",
    CAROUSEL: "CAROUSEL",
  };

  //Uploads image to media container
  function createMediaContainer(mediaUrl, mediaType = MEDIA_TYPES.IMAGE) {
    mediaType = mediaType.toUpperCase();

    //Branches
    //Carousel Image
    //is_carousel_item:true
    //image_url

    //Video
    //media_type:VIDEO
    //video_url

    //Single Image
    //image_url
    //caption

    //Accumulates post request params
    let params = {
      access_token: process.env.LONG_ACCESS_TOKEN,
    };
    switch (mediaType) {
      case MEDIA_TYPES.IMAGE:
        params.image_url = mediaUrl;
        break;
      case MEDIA_TYPES.VIDEO:
        params.video_url = mediaUrl;
        params.media_type = mediaType;
        break;
      case MEDIA_TYPES.CAROUSEL:
        params.media_type = mediaType;
        params.children = mediaUrl;
        break;
    }
    //Tests if container is part of carousel, but not actually the carousel itself
    if (isCarousel && mediaType !== MEDIA_TYPES.CAROUSEL) {
      params.is_carousel_item = true;
    } else {
      params.caption = caption;
    }

    return instaApi.post("/17841454448356423/media", {}, { params });
  }

  //Creates post media container for carousel or single item
  let postMediaContainer;
  if (isCarousel) {
    postMediaContainer = Promise.all(
      image_urls.map((img) => createMediaContainer(img))
    ).then((resArr) =>
      createMediaContainer(
        resArr.map((res) => res.data.id),
        MEDIA_TYPES.CAROUSEL
      )
    );
  } else {
    postMediaContainer = createMediaContainer(image_urls);
  }

  postMediaContainer.then((res) => console.log(res.data));

  return postMediaContainer
    .then(({ data }) =>
      //posts media container to instagram using returned media container id
      instaApi.post(
        "17841454448356423/media_publish",
        {},
        {
          params: {
            creation_id: data.id,
            access_token: process.env.LONG_ACCESS_TOKEN,
          },
        }
      )
    )
    .catch((err) => {
      console.log("error: ", err);
    });
}

export default { getLongAccessToken, createPost };
