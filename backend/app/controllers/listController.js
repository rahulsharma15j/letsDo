/**Libraries */
const listLib = require("./../libs/listLib");
const response = require("./../libs/responseLib");
const check = require("./../libs/checkLib");
const userLib = require("./../libs/userLib");
const logger = require("./../libs/loggerLib");
const notification = require("./../libs/notification");
/**Models */
const List = require("./../models/List");
const Notification = require("./../models/Notification");
const User = require("./../models/User");

/**
 * This function returns all Lists.
 */
let getAllLists = (req, res) => {
  userLib
    .findUserById(req.params.userId)
    .then(listLib.findLists)
    .then(result => {
      res.send(response.generate(false, "List found and listed.", 200, result));
    })
    .catch(err => {
      res.send(err);
    });
};

/**
 * This function returns all public lists.
 */
let getAllPublicLists = (req, res) => {
  listLib
    .findUser(req)
    .then(listLib.findPublicLists)
    .then(result => {
      res.send(response.generate(false, "List found and listed."));
    })
    .catch(err => {
      res.send(err);
    });
};

/**
 * This function returns single list.
 */
let getList = (req, res) => {
  listLib
    .findSingleList(req.params.listId)
    .then(result => {
      res.send(response.generate(false, "List found", 200, result));
    })
    .catch(err => {
      res.send(err);
    });
};

/**
 * This function delete a list
 */
let deleteList = (req, res) => {
  return new Promise((resolve, reject) => {
    List.findOneAndRemove({ listId: req.params.listId }).exec(
      (err, listDetails) => {
        if (err) {
          logger.error(err.message, "listController: deleteList()", 10);
          res.send(
            response.generate(true, "Failed to delete list.", 500, null)
          );
        } else if (check.isEmpty(listDetails)) {
          logger.info("list not found.", "listController: deleteList()", 7);
          res.send(response.generate(true, "list not found.", 404, null));
        } else {
          res.send(response.generate(false, "List deleted.", 200, listDetails));
        }
      }
    );
  });
};

/**
 * This function update the list.
 */
let updateList = (req, res) => {
  listLib
    .findSingleList(req.params.listId)
    .then(resolve => {
      req.list = resolve;
      listLib.update(req, resolve);
    })
    .then(result => {
      let obj = {
        userId: req.body.friendId,
        userName: req.body.friendName,
        creatorId: req.body.modifierId,
        creatorName: req.body.modifierName,
        data: `List "${req.list.listName}" is updated by "${
          req.body.modifierName
        }"`,
        type: "Update-list"
      };
      notification.createNotification(obj);
      res.send(response.generate(false, "List updated.", 200, null));
    })
    .catch(err => {
      res.send(err);
    });
};

/**
 * This function create a new list.
 */
let createList = (req, res) => {
  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (
        check.isEmpty(req.body.listName) ||
        check.isEmpty(req.body.creatorId) ||
        check.isEmpty(req.body.creatorName) ||
        check.isEmpty(req.body.modifierId) ||
        check.isEmpty(req.body.modifierName) ||
        check.isEmpty(req.body.mode)
      ) {
        reject(
          response.generate(true, "One or more field(s) is empty.", 400, null)
        );
      } else {
        resolve(req);
      }
    });
  };

  validateUserInput(req, res)
    .then(listLib.create)
    .then(result => {
      res.send(response.generate(false, "List created.", 200, result));
    })
    .catch(err => {
      res.send(err);
    });
};

let getAllNotifications = (req, res) => {
  userLib
    .findUserById(req.params.userId)
    .then(listLib.findNotifications)
    .then(result => {
      res.send(
        response.generate(false, "Notifications found and listed.", 200, result)
      );
    })
    .catch(err => {
      res.send(err);
    });
};

let deleteNotification = (req, res) => {
  return new Promise((resolve, reject) => {
    console.log(req.params.notificationId);
    Notification.findOneAndRemove({
      notificationId: req.params.notificationId
    }).exec((err, notificationDetails) => {
      if (err) {
        logger.error(err.message, "listController: deleteNotifications()", 10);
        res.send(
          response.generate(true, "Failed to delete notification.", 500, null)
        );
      } else if (check.isEmpty(notificationDetails)) {
        logger.info(
          "notification not found.",
          "listController: deleteNotifications()",
          7
        );
        res.send(response.generate(true, "notification not found.", 404, null));
      } else {
        res.send(response.generate(false, "Notification deleted.", 200, null));
      }
    });
  });
};

module.exports = {
  getAllLists: getAllLists,
  getAllPublicLists: getAllPublicLists,
  getList: getList,
  deleteList: deleteList,
  updateList: updateList,
  createList: createList,
  getAllNotifications: getAllNotifications,
  deleteNotification: deleteNotification
};