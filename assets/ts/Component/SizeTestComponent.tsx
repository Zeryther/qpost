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

import React, {Component} from "react";

export default class SizeTestComponent extends Component<any, any> {
	render() {
		return [
			<div className={"d-xs-block d-sm-none"}>
				xs
			</div>,
			<div className={"d-none d-sm-block d-md-none"}>
				sm
			</div>,
			<div className={"d-none d-md-block d-lg-none"}>
				md
			</div>,
			<div className={"d-none d-lg-block d-xl-none"}>
				lg
			</div>,
			<div className={"d-none d-xl-block"}>
				xl
			</div>
		];
	}
}