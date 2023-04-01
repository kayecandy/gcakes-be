import { fetchCM } from '../../../src/contentful';
import {
  MultiHandler,
  withMultiHandlers,
} from '../../../src/handlers';
import {
  authMiddleware,
  AuthMiddlewareData,
} from '../../../src/middlewares/auth-middleware';
import { errorMiddleware } from '../../../src/middlewares/error-middleware';
import { methodMiddleware } from '../../../src/middlewares/method-middleware';
import {
  publishMiddleware,
  PublishMiddlewareData,
} from '../../../src/middlewares/publish-middleware';

const addReviewHandler: MultiHandler = async (
  req,
  res,
  data: AuthMiddlewareData = {}
) => {
  const { decodedToken } = data;

  try {
    if(!decodedToken){
      throw new Error("No token passed in review handler")
    }


    const review = await fetchCM("entries", {
      method: "POST",
      headers: {
        "X-Contentful-Content-Type": "reviews",
      },
      body: JSON.stringify({
        fields: {
          rating: {
            "en-US": req.body.rating,
          },
          title: {
            "en-US": req.body.title
          },
          comment: {
            "en-US": req.body.comment,
          },
          product: {
            "en-US": {
              sys: {
                linkType: "Entry",
                id: req.query.productId,
              },
            },
          },
          user: {
            "en-US": {
              sys: {
                linkType: "Entry",
                id: decodedToken.sys.id,
              },
            },
          },
        },
      }),
    });

    if (!review.ok) {
      throw review;
    }


    const reviewJson = await review.json();

    const publishResFormatter: PublishMiddlewareData['publishResFormatter'] = async (publishRes)=>{
      const publishResJson = await publishRes.json();
      const reviewFields = publishResJson.fields;

      const {iat, exp, ...user} = decodedToken;

      return {
        sys: {
          id: publishResJson.sys.id
        },
        title: reviewFields.title["en-US"],
        rating: reviewFields.rating["en-US"],
        comment: reviewFields.comment["en-US"],
        user
      };
    }

    return {
      action: "next",
      response: res,
      data: {
        ...data,
        entryId: reviewJson.sys.id,
        publishResFormatter
      }
    };

  } catch (e) {
    return {
      action: "next",
      response: res,
      data: {
        ...data,
        error: e,
      },
    };
  }

};

export default withMultiHandlers([
  methodMiddleware(["POST"]),
  authMiddleware,
  addReviewHandler,
  publishMiddleware,
  errorMiddleware,
]);
