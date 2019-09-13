<?php
/**
 * Copyright (C) 2018-2019 Gigadrive - All rights reserved.
 * https://gigadrivegroup.com
 * https://qpo.st
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
use qpost\Entity\FeedEntry;
use qpost\Entity\User;
use qpost\Service\AuthorizationService;
use qpost\Twig\Twig;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class PageController extends AbstractController {
	/**
	 * @Route("/status/{id}")
	 *
	 * @param int $id
	 * @param EntityManagerInterface $entityManager
	 * @return Response
	 */
	public function status(int $id, EntityManagerInterface $entityManager) {
		/**
		 * @var FeedEntry $feedEntry
		 */
		$feedEntry = $entityManager->getRepository(FeedEntry::class)->findOneBy([
			"id" => $id
		]);

		if (!is_null($feedEntry)) {
			return $this->render("react.html.twig", Twig::param());
		}

		throw $this->createNotFoundException("Invalid status ID.");
	}

	/**
	 * @Route("/edit")
	 *
	 * @param Request $request
	 * @param EntityManagerInterface $entityManager
	 * @return RedirectResponse|Response
	 */
	public function edit(Request $request, EntityManagerInterface $entityManager) {
		$authService = new AuthorizationService($request, $entityManager);

		if ($authService->isAuthorized()) {
			return $this->render("react.html.twig", Twig::param());
		} else {
			return $this->redirect($this->generateUrl("qpost_login_index"));
		}
	}

	public function profile(string $username, EntityManagerInterface $entityManager) {
		$user = $entityManager->getRepository(User::class)->getUserByUsername($username);

		if (!is_null($user)) {
			return $this->render("react.html.twig", Twig::param());
		} else {
			throw $this->createNotFoundException("Invalid username.");
		}
	}
}
