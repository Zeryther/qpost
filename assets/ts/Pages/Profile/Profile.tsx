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
import User from "../../api/src/Entity/User";
import API from "../../API";
import BaseObject from "../../api/src/BaseObject";
import ContentBase from "../../Component/Layout/ContentBase";
import PageContent from "../../Component/Layout/PageContent";
import Spin from "antd/es/spin";
import "antd/es/spin/style";
import Alert from "antd/es/alert";
import "antd/es/alert/style";
import FollowButton from "../../Component/FollowButton";
import VerifiedBadge from "../../Component/VerifiedBadge";
import {Card, Menu} from "antd";
import "antd/es/card/style";
import FollowsYouBadge from "../../Component/FollowsYouBadge";
import Biography from "../../Component/Biography";
import {Redirect, Route, Switch} from "react-router-dom";
import Following from "./Following";
import Posts from "./Posts";
import Favorites from "./Favorites";
import Followers from "./Followers";
import {formatNumberShort} from "../../Util/Format";
import NightMode from "../../NightMode/NightMode";
import {setPageTitle} from "../../Util/Page";
import ProfileDropdown from "./ProfileDropdown";
import UserBlockedAlert from "../../Component/UserBlockedAlert";
import Replies from "./Replies";
import Storage from "../../Util/Storage";
import ProfileLinkedAccounts from "./ProfileLinkedAccounts";
import __ from "../../i18n/i18n";
import PrivacyBadge from "../../Component/PrivacyBadge";
import ProfileHeader from "./ProfileHeader";
import RightSidebarContent from "../../Component/Layout/RightSidebarContent";
import FollowersYouKnow from "../../Component/FollowersYouKnow";

export declare type ProfilePageProps = {
	user: User,
	parent: Profile
};

export default class Profile extends Component<any, {
	user: User,
	error: string | null,
	redirect: string | null,
	activeMenuPoint: string | null
}> {
	constructor(props) {
		super(props);

		this.state = {
			user: null,
			error: null,
			redirect: null,
			activeMenuPoint: null
		};
	}

	componentDidMount(): void {
		const username = this.props.match.params.username;

		if (username) {
			const stored = Storage.sessionGet(Storage.SESSION_USER + "_" + username);
			this.setState({
				user: BaseObject.convertObject(User, JSON.parse(stored))
			});

			API.i.user.get(username).then(user => {
				this.setState({
					user
				});

				setPageTitle(user.getDisplayName() + " (@" + user.getUsername() + ")");
			}).catch(reason => {
				this.setState({
					error: reason
				});
			});
		} else {
			this.setState({
				error: __("error.general")
			});
		}
	}

	render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
		const user = this.state.user;
		const error = this.state.error;

		if (user !== null) {
			const registerDate: Date = new Date(user.getTime());
			const birthDate: Date | null = user.getBirthday() ? new Date(user.getBirthday()) : null;

			return <div className={"profile"}>
				{this.state.redirect ? <Redirect push to={this.state.redirect}/> : ""}

				<ProfileHeader user={user}/>

				<Card className={"mobilePart mb-3"} size={"small"}
					  style={user.getHeaderURL() ? {borderTopLeftRadius: 0, borderTopRightRadius: 0} : {}}>
					<div className={"clearfix"}>
						<div className={"float-left"}>
							<img className={"mobileAvatar"} src={user.getAvatarURL()} alt={user.getUsername()}
								 style={{
									 backgroundColor: "#000"
								 }}/>
						</div>

						<div className={"float-left"}>
							<h4 className={"mb-0"}>{user.getDisplayName()}<VerifiedBadge
								target={user}/><PrivacyBadge target={user}/></h4>
							<div className={"usernameDisplay"}>@{user.getUsername()}<FollowsYouBadge
								target={user}/></div>
						</div>
					</div>

					<div className={"mt-2"}>
						<Biography user={user}/>

						<p className={"my-2 text-muted clearfix"}>
							<div className={"float-left"}>
								<i className={"fas fa-globe"}/><span
								style={{marginLeft: "5px"}}>{__("profile.joined", {
								"%date%": registerDate.toLocaleString("default", {
									month: "long",
									year: "numeric"
								})
							})}</span>
							</div>
							{birthDate ? <div className={"float-left ml-2"}>
								<i className={"fas fa-birthday-cake"}/><span
								style={{marginLeft: "7px"}}>{birthDate.toLocaleString("default", {
								month: "long",
								day: "numeric",
								year: "numeric"
							})}</span>
							</div> : ""}
						</p>

						<ProfileLinkedAccounts user={user}/>

						<FollowButton target={user}/>

						<ProfileDropdown user={user} placement={"bottomLeft"} className={"ml-3"}/>
					</div>
				</Card>

				{user.isBlocked() ? <UserBlockedAlert user={user}/> : ""}

				<Menu theme={NightMode.isActive() ? "dark" : "light"}
					  selectedKeys={[this.state.activeMenuPoint]} mode={"horizontal"} onClick={(e) => {
					if (e.key) {
						const key = e.key;

						if (key !== this.state.activeMenuPoint) {
							switch (key) {
								case "POSTS":
									this.setState({
										activeMenuPoint: key,
										redirect: "/" + user.getUsername()
									});
									break;
								case "REPLIES":
									this.setState({
										activeMenuPoint: key,
										redirect: "/" + user.getUsername() + "/replies"
									});
									break;
								case "FOLLOWING":
									this.setState({
										activeMenuPoint: key,
										redirect: "/" + user.getUsername() + "/following"
									});
									break;
								case "FOLLOWERS":
									this.setState({
										activeMenuPoint: key,
										redirect: "/" + user.getUsername() + "/followers"
									});
									break;
								case "FAVORITES":
									this.setState({
										activeMenuPoint: key,
										redirect: "/" + user.getUsername() + "/favorites"
									});
									break;
							}
						}
					}
				}}>
					<Menu.Item key={"POSTS"}>
						{__("profile.posts")} ({formatNumberShort(user.getTotalPostCount())})
					</Menu.Item>

					<Menu.Item key={"REPLIES"}>
						{__("profile.replies")}
					</Menu.Item>

					<Menu.Item key={"FOLLOWING"}>
						{__("profile.following")} ({formatNumberShort(user.getFollowingCount())})
					</Menu.Item>

					<Menu.Item key={"FOLLOWERS"}>
						{__("profile.followers")} ({formatNumberShort(user.getFollowerCount())})
					</Menu.Item>

					<Menu.Item key={"FAVORITES"}>
						{__("profile.favorites")} ({formatNumberShort(user.getFavoritesCount())})
					</Menu.Item>
				</Menu>

				<Switch>
					<Route path={"/:username/following"}
						   render={(props) => <Following {...props} user={this.state.user} parent={this}/>}/>
					<Route path={"/:username/followers"}
						   render={(props) => <Followers {...props} user={this.state.user} parent={this}/>}/>
					<Route path={"/:username/favorites"}
						   render={(props) => <Favorites {...props} user={this.state.user} parent={this}/>}/>
					<Route path={"/:username/replies"}
						   render={(props) => <Replies {...props} user={this.state.user} parent={this}/>}/>
					<Route path={"/:username"}
						   render={(props) => <Posts {...props} user={this.state.user} parent={this}/>}/>
				</Switch>

				<RightSidebarContent>
					<FollowersYouKnow user={this.state.user}/>
				</RightSidebarContent>
			</div>;
		} else if (error !== null) {
			return <ContentBase>
				<PageContent>
					<Alert message={__("error.userNotFound")} type="error"/>
				</PageContent>
			</ContentBase>;
		} else {
			return <ContentBase>
				<PageContent>
					<div className={"text-center my-3"}>
						<Spin size={"large"}/>
					</div>
				</PageContent>
			</ContentBase>;
		}
	}
}