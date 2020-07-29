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
import DesktopHeader from "./DesktopHeader";
import {Link} from "react-router-dom";
import Auth from "../../../Auth/Auth";
import AccountSwitcher from "../../../Component/AccountSwitcher";

export default class DesktopHeaderAccountDropdown extends Component<{
	open: boolean,
	parent: DesktopHeader
}, any> {
	render() {
		const user = Auth.getCurrentUser();

		return <div className={(!this.props.open ? "d-none " : "") + "desktopHeaderAccountDropdown"}>
			<div className={"profileInfo"}>
				<div className={"profileInfoLeft"}>
					<img src={user.getAvatarURL()} alt={user.getUsername()} title={user.getUsername()}/>
				</div>

				<div className={"profileInfoRight"}>
					<div className={"profileInfoDisplayName"}>{user.getDisplayName()}</div>
					<div className={"profileInfoUserName"}>{"@" + user.getUsername()}</div>
				</div>
			</div>

			<hr/>

			<Link to={"/profile/" + Auth.getCurrentUser().getUsername()} onClick={this.close}>
				<i className="fas fa-user iconMargin-10"/>My profile
			</Link>

			<Link to={"/notifications"} onClick={this.close}>
				<i className="fas fa-bell iconMargin-10"/>Notifications
			</Link>

			<Link to={"/messages"} onClick={this.close}>
				<i className="fas fa-envelope iconMargin-10"/>Messages
			</Link>

			<hr/>

			<a href={"/settings/preferences/appearance"} onClick={this.close}>
				<i className="fas fa-wrench iconMargin-10"/>Settings
			</a>

			<Link to={"#"} onClick={(e) => {
				e.preventDefault();

				this.close();
				AccountSwitcher.open();
			}}>
				<i className={"fas fa-user-friends iconMargin-10"}/>Switch account
			</Link>

			<Link to={"#"} onClick={(e) => {
				e.preventDefault();

				this.close();
				Auth.logout();
			}}>
				<i className="fas fa-sign-out-alt iconMargin-10"/>Log out
			</Link>
		</div>;
	}

	private close(): void {
		this.props.parent.setState({
			accountDropdownOpen: false
		});
	}
}