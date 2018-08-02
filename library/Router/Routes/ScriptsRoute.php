<?php

$app->post("/scripts/toggleFollow",function(){
	$this->response->mime ="json";
	
	if(isset($_POST["user"])){
		if(Util::isLoggedIn()){
			$user = Util::getCurrentUser();
			$toFollow = User::getUserById($_POST["user"]);

			if($user->getFollowers() < FOLLOW_LIMIT){
				if(!is_null($user) && !is_null($toFollow)){
					if($user->getId() != $toFollow->getId()){
						$followStatus = -1;

						if($user->isFollowing($toFollow)){
							$user->unfollow($toFollow);
							$followStatus = 0;
						} else {
							$user->follow($toFollow);
							$followStatus = 1;
						}
		
						return json_encode(["followStatus" => $followStatus]);
					} else {
						return json_encode(["error" => "Can't follow self"]);
					}
				} else {
					return json_encode(["error" => "Invalid user"]);
				}
			} else {
				return json_encode(["error" => "Reached follow limit"]);
			}
		} else {
			return json_encode(["error" => "Not logged in"]);
		}
	} else {
		return json_encode(["error" => "Bad request"]);
	}
});

$app->post("/scripts/toggleFavorite",function(){
	$this->response->mime ="json";
	
	if(isset($_POST["post"])){
		if(Util::isLoggedIn()){
			$user = Util::getCurrentUser();
			$post = FeedEntry::getEntryById($_POST["post"]);

			if(is_null($post))
				return json_encode(["error" => "Unknown post"]);

			if($user->hasFavorited($post->getId())){
				$user->unfavorite($post->getId());
			} else {
				$user->favorite($post->getId());
			}

			if($user->hasFavorited($post->getId())){
				return json_encode(["status" => "Favorite added"]);
			} else {
				return json_encode(["status" => "Favorite removed"]);
			}
		} else {
			return json_encode(["error" => "Not logged in"]);
		}
	} else {
		return json_encode(["error" => "Bad request"]);
	}
});

$app->post("/scripts/toggleShare",function(){
	$this->response->mime ="json";
	
	if(isset($_POST["post"])){
		if(Util::isLoggedIn()){
			$user = Util::getCurrentUser();
			$post = FeedEntry::getEntryById($_POST["post"]);

			if(is_null($post))
				return json_encode(["error" => "Unknown post"]);

			if($post->getUserId() == $user->getId())
				return json_encode(["error" => "Cant share own post"]);

			if($user->hasShared($post->getId())){
				$user->unshare($post->getId());
			} else {
				$user->share($post->getId());
			}

			if($user->hasShared($post->getId())){
				return json_encode(["status" => "Share added"]);
			} else {
				return json_encode(["status" => "Share removed"]);
			}
		} else {
			return json_encode(["error" => "Not logged in"]);
		}
	} else {
		return json_encode(["error" => "Bad request"]);
	}
});

$app->post("/scripts/extendHomeFeed",function(){
	$this->response->mime = "json";

	if(Util::isLoggedIn()){
		$currentUser = Util::getCurrentUser();
		$mysqli = Database::Instance()->get();

		$a = $currentUser->getFollowingAsArray();
		array_push($a,$currentUser->getId());

		$i = $mysqli->real_escape_string(implode(",",$a));

		if(isset($_POST["mode"])){
			if($_POST["mode"] == "loadOld"){
				if(isset($_POST["firstPost"])){
					$posts = [];
					$firstPost = (int)$_POST["firstPost"];

					$stmt = $mysqli->prepare("SELECT f.`id` AS `postID`,f.`text` AS `postText`,f.`time` AS `postTime`,f.`sessionId`,f.`post` AS `sharedPost`,u.* FROM `feed` AS f INNER JOIN `users` AS u ON f.`user` = u.`id` WHERE (f.`type` = 'POST' OR f.`type` = 'SHARE') AND f.`user` IN ($i) AND f.`id` < ? ORDER BY f.`time` DESC LIMIT 30");
					$stmt->bind_param("i",$firstPost);
					if($stmt->execute()){
						$result = $stmt->get_result();

						if($result->num_rows){
							while($row = $result->fetch_assoc()){
								$entry = FeedEntry::getEntryFromData($row["postID"],$row["id"],$row["postText"],null,$row["sharedPost"],$row["sessionId"],"POST",$row["postTime"]);

								array_push($posts,[
									"id" => $entry->getId(),
									"text" => Util::convertPost($entry->getText()),
									"time" => Util::timeago($entry->getTime()),
									"userName" => $entry->getUser()->getUsername(),
									"userDisplayName" => $entry->getUser()->getDisplayName(),
									"userAvatar" => $entry->getUser()->getAvatarURL()
								]);
							}
						}
					}
					$stmt->close();

					return json_encode(["result" => $posts]);
				} else {
					return json_encode(["error" => "Bad request"]);
				}
			} else if($_POST["mode"] == "loadNew"){
				if(isset($_POST["lastPost"])){
					$posts = [];
					$lastPost = (int)$_POST["lastPost"];

					$stmt = $mysqli->prepare("SELECT f.`id` AS `postID`,f.`text` AS `postText`,f.`time` AS `postTime`,f.`sessionId`,f.`post` AS `sharedPost`,u.* FROM `feed` AS f INNER JOIN `users` AS u ON f.`user` = u.`id` WHERE (f.`type` = 'POST' OR f.`type` = 'SHARE') AND f.`user` IN ($i) AND f.`id` > ? ORDER BY f.`time` DESC LIMIT 30");
					$stmt->bind_param("i",$lastPost);
					if($stmt->execute()){
						$result = $stmt->get_result();

						if($result->num_rows){
							while($row = $result->fetch_assoc()){
								$entry = FeedEntry::getEntryFromData($row["postID"],$row["id"],$row["postText"],null,$row["sharedPost"],$row["sessionId"],"POST",$row["postTime"]);

								array_push($posts,[
									"id" => $entry->getId(),
									"text" => Util::convertPost($entry->getText()),
									"time" => Util::timeago($entry->getTime()),
									"userName" => $entry->getUser()->getUsername(),
									"userDisplayName" => $entry->getUser()->getDisplayName(),
									"userAvatar" => $entry->getUser()->getAvatarURL()
								]);
							}
						}
					}
					$stmt->close();

					return json_encode(["result" => $posts]);
				} else {
					return json_encode(["error" => "Bad request"]);
				}
			} else {
				return json_encode(["error" => "Bad request"]);
			}
		} else {
			return json_encode(["error" => "Bad request"]);
		}
	} else {
		return json_encode(["error" => "Not logged in"]);
	}
});

$app->post("/scripts/createPost",function(){
	$this->response->mime = "json";
	
	if(isset($_POST["text"])){
		if(Util::isLoggedIn()){
			$user = Util::getCurrentUser();
			$text = $_POST["text"];

			$mentioned = Util::getUsersMentioned($text);

			if($text <= POST_CHARACTER_LIMIT){
				if(count($mentioned) < 15){
					$text = Util::sanatizeString($text);

					$userId = $user->getId();
					$sessionId = session_id();
					$type = FEED_ENTRY_TYPE_POST;

					$postId = null;

					$mysqli = Database::Instance()->get();
					$stmt = $mysqli->prepare("INSERT INTO `feed` (`user`,`text`,`following`,`sessionId`,`type`) VALUES(?,?,NULL,?,?);");
					$stmt->bind_param("isss", $userId,$text,$sessionId,$type);
					if($stmt->execute()){
						$postId = $stmt->insert_id;
					}
					$stmt->close();

					if(!is_null($postId)){
						$post = [];

						$stmt = $mysqli->prepare("SELECT `text`,`time` FROM `feed` WHERE `id` = ? LIMIT 1");
						$stmt->bind_param("i",$postId);
						if($stmt->execute()){
							$result = $stmt->get_result();

							if($result->num_rows){
								$row = $result->fetch_assoc();

								$post["id"] = $postId;
								$post["text"] = Util::convertPost($row["text"]);
								$post["time"] = Util::timeago($row["time"]);
								$post["userName"] = $user->getUsername();
								$post["userDisplayName"] = $user->getDisplayName();
								$post["userAvatar"] = $user->getAvatarURL();
							}
						}
						$stmt->close();

						if(count($mentioned) > 0){
							foreach($mentioned as $u){
								$uid = $u->getId();
								if($uid == $userId) continue;

								if(!$user->isBlocked($u)){
									if($u->canPostNotification(NOTIFICATION_TYPE_MENTION,null,$postId)){
										$stmt = $mysqli->prepare("INSERT INTO `notifications` (`user`,`type`,`post`) VALUES(?,'MENTION',?);");
										$stmt->bind_param("ii",$uid,$postId);
										$stmt->execute();
										$stmt->close();
									}
								}
							}
						}

						$user->reloadFeedEntriesCount();
						$user->reloadPostsCount();

						return json_encode(["post" => $post]);
					} else {
						return json_encode(["error" => "Empty post id"]);
					}
				} else {
					return json_encode(["error" => "Too many mentions"]);
				}
			} else {
				return json_encode(["error" => "Exceeded character limit"]);
			}

			if($user->getFollowers() < FOLLOW_LIMIT){
				if(!is_null($user) && !is_null($toFollow)){
					if($user->getId() != $toFollow->getId()){
						$followStatus = -1;

						if($user->isFollowing($toFollow)){
							$user->unfollow($toFollow);
							$followStatus = 0;
						} else {
							$user->follow($toFollow);
							$followStatus = 1;
						}
		
						return json_encode(["followStatus" => $followStatus]);
					} else {
						return json_encode(["error" => "Can't follow self"]);
					}
				} else {
					return json_encode(["error" => "Invalid user"]);
				}
			} else {
				return json_encode(["error" => "Reached follow limit"]);
			}
		} else {
			return json_encode(["error" => "Not logged in"]);
		}
	} else {
		return json_encode(["error" => "Bad request"]);
	}
});