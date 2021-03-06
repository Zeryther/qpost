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

use qpost\Twig\Twig;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class RedirectController extends qpostController {
	/**
	 * @Route("/terms")
	 *
	 * @return Response
	 */
	public function terms() {
		return $this->render("pages/terms.html.twig", Twig::param([
			"title" => __("landing.footer.legal.terms")
		]));
//		return $this->redirect("https://go.qpo.st/terms");
	}

	/**
	 * @Route("/privacy")
	 *
	 * @return Response
	 */
	public function privacy() {
		return $this->redirect("https://gigadrivegroup.com/legal/privacy-policy");
		/*return $this->render("pages/privacy.html.twig", Twig::param([
			"title" => "Privacy Policy"
		]));*/
//		return $this->redirect("https://go.qpo.st/privacy");
	}

	/**
	 * @Route("/disclaimer")
	 *
	 * @return Response
	 */
	public function disclaimer() {
		return $this->render("pages/disclaimer.html.twig", Twig::param([
			"title" => __("landing.footer.legal.disclaimer")
		]));
//		return $this->redirect("https://go.qpo.st/disclaimer");
	}

	/**
	 * @Route("/rules")
	 *
	 * @return Response
	 */
	public function rules() {
		return $this->render("pages/rules.html.twig", Twig::param([
			"title" => __("landing.footer.legal.rules")
		]));
//		return $this->redirect("https://go.qpo.st/rules");
	}

	/**
	 * @Route("/contact")
	 *
	 * @return Response
	 */
	public function contact() {
		return $this->redirect("https://go.qpo.st/contact");
	}

	/**
	 * @Route("/help")
	 *
	 * @return Response
	 */
	public function help() {
		return $this->redirect("https://go.qpo.st/help");
	}

	/**
	 * @Route("/advertise")
	 *
	 * @return Response
	 */
	public function advertise() {
		return $this->redirect("https://go.qpo.st/advertise");
	}

	/**
	 * @Route("/account")
	 *
	 * @return Response
	 */
	public function account() {
		return $this->redirectToRoute("qpost_settings_accountinformation");
	}

	/**
	 * @Route("/account/privacy")
	 *
	 * @return Response
	 */
	public function accountPrivacy() {
		return $this->redirectToRoute("qpost_settings_privacy");
	}

	/**
	 * @Route("/account/privacy/level")
	 *
	 * @return Response
	 */
	public function accountPrivacyLevel() {
		return $this->redirectToRoute("qpost_settings_privacy");
	}

	/**
	 * @Route("/account/privacy/blocked")
	 *
	 * @return Response
	 */
	public function accountPrivacyBlocked() {
		return $this->redirectToRoute("qpost_settings_relationshipsblocked");
	}

	/**
	 * @Route("/account/sessions")
	 *
	 * @return RedirectResponse
	 */
	public function accountSessions() {
		return $this->redirectToRoute("qpost_settings_accountsessions");
	}

	/**
	 * @Route("/edit")
	 *
	 * @return RedirectResponse
	 */
	public function edit() {
		return $this->redirectToRoute("qpost_settings_profileappearance");
	}
}