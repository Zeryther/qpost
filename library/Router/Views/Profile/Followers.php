<?php

$mysqli = Database::Instance()->get();
$itemsPerPage = 40;

$num = $user->getFollowers();
$uID = $user->getId();

$showNoUsersInfo = false;

if($num > 0){
	$users = [];

	$stmt = $mysqli->prepare("SELECT u.* FROM `follows` AS f INNER JOIN `users` AS u ON f.`follower` = u.`id` WHERE f.`following` = ? ORDER BY f.`time` DESC LIMIT " . (($currentPage-1)*$itemsPerPage) . " , " . $itemsPerPage);
	$stmt->bind_param("i",$uID);
	if($stmt->execute()){
		$result = $stmt->get_result();

		if($result->num_rows){
			while($row = $result->fetch_assoc()){
				array_push($users,User::getUserByData($row["id"],$row["displayName"],$row["username"],$row["email"],$row["avatar"],$row["bio"],$row["token"],$row["time"]));
			}
		}
	}
	$stmt->close();

	echo Util::paginate($currentPage,$itemsPerPage,$num,"/" . $user->getUsername() . "/followers/(:num)");

	if(count($users) > 0){
		echo '<div class="row mt-2">';

		for($i = 0; $i < count($users); $i++){
			$u = $users[$i];
			$last = $i == count($users)-1;

			$user->cacheFollower($u->getId());
		?>
		<div class="card userCard col-md-4" data-user-id="<?= $u->getId(); ?>">
			<div class="card-body">
				<center>
					<a href="<?= $app->routeUrl("/" . $u->getUsername()); ?>" class="clearUnderline"><img src="<?= $u->getAvatarURL(); ?>" width="60" height="60"/>

					<h5 class="mb-0"><?= $u->getDisplayName(); ?></a></h5>
					<p class="text-muted my-0" style="font-size: 16px">@<?= $u->getUsername(); ?></p>

					<?= !is_null($u->getBio()) ? '<p class="mb-0 mt-2">' . Util::convertLineBreaksToHTML($u->getBio()) . '</p>' : ""; ?>

					<?= Util::followButton($u->getId(),true,["btn-block","mt-2"]) ?>
				</center>
			</div>
		</div>
		<?php
		}

		echo '</div>';
	} else {
		$showNoUsersInfo = true;
	}

	echo Util::paginate($currentPage,$itemsPerPage,$num,"/" . $user->getUsername() . "/followers/(:num)");
} else {
	$showNoUsersInfo = true;
}

if($showNoUsersInfo){
	echo '<div class="mt-2">' . Util::createAlert("noPosts","<b>There's nothing here yet!</b><br/>@" . $user->getUsername() . " has no followers yet!",ALERT_TYPE_INFO) . '</div>';
}