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
import { publishMiddleware } from '../../../src/middlewares/publish-middleware';

const addReviewHandler: MultiHandler = async (
  req,
  res,
  data: AuthMiddlewareData = {}
) => {
  const { decodedToken } = data;

  try {
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
                id: decodedToken?.sys?.id ?? "",
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

    return {
      action: "next",
      response: res,
      data: {
        ...data,
        entryId: reviewJson.sys.id
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
