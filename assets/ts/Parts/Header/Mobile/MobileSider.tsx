import React, {Component} from "react";
import {Avatar, Layout, Menu} from "antd";
import NightMode from "../../../NightMode/NightMode";
import Auth from "../../../Auth/Auth";
import User from "../../../Entity/Account/User";
import {Link} from "react-router-dom";
import VerifiedBadge from "../../../Component/VerifiedBadge";
import ClickEvent = JQuery.ClickEvent;

export default class MobileSider extends Component<{
	mobile: boolean,
	key: any
}, {
	collapsed: boolean,
	mobileMenu: boolean
}> {
	constructor(props) {
		super(props);

		this.state = {
			collapsed: true,
			mobileMenu: this.props.mobile
		};
	}

	componentDidMount(): void {
		$("#mobileSiderTrigger").off("click").on("click", (e: ClickEvent) => {
			e.preventDefault();

			this.setState({
				collapsed: !this.state.collapsed
			});
		});
	}

	toggle = () => {
		this.setState({
			collapsed: !this.state.collapsed
		});
	};

	render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
		const currentUser: User = Auth.getCurrentUser();

		return [
			<Layout.Sider
				key={0}
				className={"mobileSider" + (!this.props.mobile ? " d-none" : "")}
				breakpoint="lg"
				collapsedWidth="0"
				trigger={null}
				collapsible
				collapsed={this.state.collapsed}
				style={{
					position: "fixed",
					zIndex: 100,
					height: "100%"
				}}
				onBreakpoint={broken => {
					this.setState({
						mobileMenu: broken
					});
				}}>
				<div className={"mx-2 my-2 clearfix"}>
					<Link to={"/" + currentUser.getUsername()} className={"clearUnderline"}
						  onClick={(e) => this.toggle()}>
						<Avatar src={currentUser.getAvatarURL()} className={"mr-2"} shape={"square"} size={"large"}
								style={{
									float: "left"
								}}/>
					</Link>

					<div style={{float: "left", width: "calc(100% - 40px - 20px)"}}>
						<div className={"displayName"}>
							{currentUser.getDisplayName()}<VerifiedBadge target={currentUser}/>
						</div>

						<div className={"username"}>
							@{currentUser.getUsername()}
						</div>
					</div>
				</div>

				<Menu theme={NightMode.isActive() ? "dark" : "light"} mode="inline" selectable={false}>
					<Menu.Item key="1">
						<Link to={"/" + currentUser.getUsername()} className={"clearUnderline"}>
							<i className={"far fa-user iconMargin-10"}/>
							<span className="nav-text">Profile</span>
						</Link>
					</Menu.Item>
					<Menu.Item key="2">
						<Link to={"/account"} className={"clearUnderline"}>
							<i className={"fas fa-cog iconMargin-10"}/>
							<span className="nav-text">Settings</span>
						</Link>
					</Menu.Item>
					<Menu.Item key="3">
						<Link to={"/logout"} onClick={(e) => {
							e.preventDefault();
							Auth.logout();
						}} className={"clearUnderline"}>
							<i className={"fas fa-sign-out-alt iconMargin-10"}/>
							<span className="nav-text">Logout</span>
						</Link>
					</Menu.Item>
					<Menu.Item key="4">
						<Link to={"/nightmode"} onClick={(e) => {
							e.preventDefault();
							NightMode.toggle();
						}} className={"clearUnderline"}>
							<i className={"far fa-lightbulb iconMargin-10"}/>
							<span className="nav-text">Toggle night mode</span>
						</Link>
					</Menu.Item>
				</Menu>
			</Layout.Sider>,
			<div key={1} className={"mobileSliderBackdrop" + (!this.state.collapsed ? " open" : "")} onClick={(e) => {
				e.preventDefault();

				if (!this.state.collapsed) {
					this.setState({
						collapsed: !this.state.collapsed
					});
				}
			}}/>
		];
	}
}