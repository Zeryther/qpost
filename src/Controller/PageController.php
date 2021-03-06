<?php
/*
 * Copyright (C) 2018-2020 Gigadrive - All rights reserved.
 * https://gigadrivegroup.com
 * https://qpostapp.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://gnu.org/licenses/>
 */

namespace qpost\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Gigadrive\Bundle\SymfonyExtensionsBundle\DependencyInjection\Util;
use qpost\Constants\MiscConstants;
use qpost\Entity\FeedEntry;
use qpost\Entity\MediaFile;
use qpost\Entity\User;
use qpost\Service\APIService;
use qpost\Service\AuthorizationService;
use qpost\Service\RenderService;
use qpost\Twig\Twig;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use function __;
use function array_first;
use function is_null;
use function sprintf;
use function strlen;
use function trim;

class PageController extends qpostController {
	/**
	 * @Route("/status/{id}")
	 *
	 * @param int $id
	 * @param EntityManagerInterface $entityManager
	 * @param RenderService $renderService
	 * @param APIService $apiService
	 * @return Response
	 */
	public function status(int $id, EntityManagerInterface $entityManager, RenderService $renderService, APIService $apiService) {
		/**
		 * @var FeedEntry $feedEntry
		 */
		$feedEntry = $entityManager->getRepository(FeedEntry::class)->findOneBy([
			"id" => $id
		]);

		if (!is_null($feedEntry) && $apiService->mayView($feedEntry)) {
			$user = $feedEntry->getUser();
			$text = $feedEntry->getText();

			$title = __("status.headline", ["%displayName%" => $user->getDisplayName()]) . ($text ? ": \"%s\"" : "");

			if ($text) {
				$reservedTitleLength = strlen(sprintf($title, ""));

				$title = sprintf($title, Util::limitString($text, MiscConstants::META_TITLE_LENGTH - $reservedTitleLength, true));
			}

			$bigSocialImage = $this->generateUrl("qpost_home_index", [], UrlGeneratorInterface::ABSOLUTE_URL) . "assets/img/bigSocialImage-default.png";

			$twitterCardType = "summary";

			/**
			 * @var MediaFile $mediaFile
			 */
			$mediaFile = array_first($feedEntry->getAttachments());
			if ($mediaFile) {
				$twitterCardType = "summary_large_image";
				$bigSocialImage = $mediaFile->getURL();
			}

			$emptyText = is_null($text) || empty($text) || trim($text) === "";

			$replies = $feedEntry->getReplyCount();
			$shares = $feedEntry->getShareCount();
			$favorites = $feedEntry->getFavoriteCount();

			return $renderService->react([
				"title" => $title,
				"twitterImage" => $user->getAvatarURL(),
				"bigSocialImage" => $bigSocialImage,
				"description" => Util::limitString(($emptyText ? "" : ($text . ". ")) . " Post by " . $user->getDisplayName() . "(@" . $user->getUsername() . "). " . $replies . " repl" . ($replies === 1 ? "y" : "ies") . ", " . $shares . " share" . ($shares === 1 ? "" : "s") . " and " . $favorites . " favorite" . ($favorites === 1 ? "" : "s") . ".", MiscConstants::META_DESCRIPTION_LENGTH, true),
				"twitterCardType" => $twitterCardType
			]);
		}

		throw $this->createNotFoundException("Invalid status ID.");
	}

	/**
	 * @Route("/goodbye")
	 *
	 * @param RenderService $renderService
	 * @return Response
	 */
	public function goodbye(RenderService $renderService) {
		return $renderService->react([
			"title" => __("goodbye.headline"),
			"bigSocialImage" => $this->generateUrl("qpost_home_index", [], UrlGeneratorInterface::ABSOLUTE_URL) . "assets/img/bigSocialImage-default.png",
			"twitterImage" => $this->generateUrl("qpost_home_index", [], UrlGeneratorInterface::ABSOLUTE_URL) . "assets/img/favicon-512.png"
		]);
	}

	/**
	 * @Route("/search")
	 *
	 * @param RenderService $renderService
	 * @return Response
	 */
	public function search(RenderService $renderService) {
		return $renderService->react([
			"title" => __("search.headline"),
			"bigSocialImage" => $this->generateUrl("qpost_home_index", [], UrlGeneratorInterface::ABSOLUTE_URL) . "assets/img/bigSocialImage-default.png",
			"twitterImage" => $this->generateUrl("qpost_home_index", [], UrlGeneratorInterface::ABSOLUTE_URL) . "assets/img/favicon-512.png"
		]);
	}

	/**
	 * @Route("/offline.html")
	 *
	 * @return Response
	 */
	public function offline() {
		return $this->render("pages/offline.html.twig", Twig::param([
			"title" => __("offline.headline")
		]));
	}

	/**
	 * @Route("/hashtag/{tag}")
	 *
	 * @param string $tag
	 * @return Response
	 */
	public function hashtag(string $tag) {
		return $this->forward("qpost\Controller\PageController::search");
	}

	/**
	 * @Route("/notifications")
	 *
	 * @param RenderService $renderService
	 * @return RedirectResponse|Response
	 */
	public function notifications(RenderService $renderService) {
		$user = $this->getUser();

		if ($user) {
			return $renderService->react();
		} else {
			return $this->redirect($this->generateUrl("qpost_login_index"));
		}
	}

	/**
	 * @Route("/messages")
	 *
	 * @param RenderService $renderService
	 * @return RedirectResponse|Response
	 */
	public function messages(RenderService $renderService) {
		$user = $this->getUser();

		if ($user) {
			return $renderService->react();
		} else {
			return $this->redirect($this->generateUrl("qpost_login_index"));
		}
	}

	public function profile(string $username, EntityManagerInterface $entityManager, RenderService $renderService) {
		$user = $entityManager->getRepository(User::class)->getUserByUsername($username);

		if (!is_null($user)) {
			return $renderService->react([
				"title" => $user->getDisplayName() . " (@" . $user->getUsername() . ")",
				"description" => Util::limitString("Check the latest posts from " . $user->getDisplayName() . " (@" . $user->getUsername() . "). " . $user->getBio(), MiscConstants::META_DESCRIPTION_LENGTH, true),
				"twitterImage" => $user->getAvatarURL(),
				"bigSocialImage" => $user->getAvatarURL()
			]);
		} else {
			throw $this->createNotFoundException("Invalid username.");
		}
	}
}
