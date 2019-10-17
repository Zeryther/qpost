/*
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

import React, {Component} from "react";
import FeedEntry from "../../Entity/Feed/FeedEntry";
import Tooltip from "antd/es/tooltip";
import "antd/es/tooltip/style";
import Button from "antd/es/button";
import "antd/es/button/style";
import "antd/es/input/style";
import Modal from "antd/es/modal";
import "antd/es/modal/style";
import AntMessage from "antd/es/message";
import WindowSizeListener from "react-window-size-listener";
import $ from "jquery";
import API from "../../API/API";
import BaseObject from "../../Serialization/BaseObject";
import FeedEntryList from "../FeedEntry/FeedEntryList";
import Upload, {RcFile, UploadChangeParam} from "antd/es/upload";
import Spin from "antd/es/spin";
import PostFormUploadItem from "./PostFormUploadItem";
import {Mentions, Switch} from "antd";
import "antd/es/switch/style";
import "antd/es/icon/style";
import "antd/es/mentions/style";
import User from "../../Entity/Account/User";
import Auth from "../../Auth/Auth";
import VerifiedBadge from "../VerifiedBadge";

export default class PostForm extends Component<any, {
	mobile: boolean,
	message: string | null,
	posting: boolean,
	photos: PostFormUploadItem[],
	nsfw: boolean,
	suggestedUsers: User[],
	loadingUsers: boolean
	replyTo: FeedEntry | null,
	open: boolean
}> {
	private static keyDownInitiated: boolean = false;
	public static INSTANCE: PostForm = null;

	constructor(props) {
		super(props);

		this.state = {
			mobile: window.innerWidth <= 768,
			message: "",
			posting: false,
			photos: [],
			nsfw: false,
			suggestedUsers: [],
			loadingUsers: false,
			replyTo: null,
			open: false
		};
	}

	public static open(): void {
		if (this.INSTANCE !== null) {
			this.INSTANCE.setState({
				open: true
			});
		}
	}

	public static close(): void {
		if (this.INSTANCE !== null) {
			this.INSTANCE.setState({
				open: false
			});
		}
	}

	componentDidMount(): void {
		if (!PostForm.keyDownInitiated) {
			PostForm.keyDownInitiated = true;

			$(document).on("keydown", "#postFormTextarea", (e) => {
				if ((e.keyCode == 10 || e.keyCode == 13) && e.ctrlKey) {
					// CTRL+Enter

					this.send(e);
				}
			});
		}

		if (PostForm.INSTANCE === null) {
			PostForm.INSTANCE = this;
		}
	}

	componentWillUnmount(): void {
		if (PostForm.INSTANCE === this) {
			PostForm.INSTANCE = null;
		}
	}

	readyToPost(): boolean {
		return this.state.posting === false && ((this.state.message != null && this.state.message.length >= 1 && this.state.message.length <= 300) || (this.state.photos.length > 0));
	}

	isReply: () => boolean = () => {
		return !!this.state.replyTo;
	};

	setMobile = (windowWidth: number) => {
		const mobile = windowWidth <= 768;

		if (this.state.mobile !== mobile) {
			this.setState({
				mobile
			});
		}
	};

	close = () => {
		this.setState({
			open: false
		});

		this.reset();
	};

	reset = () => {
		this.setState({
			posting: false,
			message: null,
			photos: [],
			nsfw: false,
			replyTo: null
		});
	};

	send = (e) => {
		e.preventDefault();

		if (this.readyToPost()) {
			const message: string = this.state.message || "";

			this.setState({
				posting: true
			});

			const attachments: string[] = [];
			this.state.photos.forEach(photo => {
				const base64 = photo.base64;

				if (base64) {
					attachments.push(base64);
				}
			});

			const nsfw: boolean = this.state.nsfw;

			API.handleRequest("/status", "POST", {
				message,
				attachments,
				nsfw
			}, data => {
				if (data.hasOwnProperty("post")) {
					const post: FeedEntry = BaseObject.convertObject(FeedEntry, data.post);
					const entryList: FeedEntryList | null = FeedEntryList.instance;

					AntMessage.success("Your post has been sent.");

					if (entryList) {
						entryList.prependEntry(post);
					}

					this.close();
					this.reset();
				} else {
					AntMessage.error("An error occurred.");
					this.setState({
						posting: false
					});
				}
			}, error => {
				AntMessage.error(error);
				this.setState({
					posting: false
				});
			});
		}
	};

	change = (value) => {
		this.setState({
			message: value
		});
	};

	beforeUpload = (file: RcFile, FileList: RcFile[]) => {
		const size: number = file.size;
		const type: string = file.type;

		if (!(type === "image/jpeg" || type === "image/png" || type === "image/gif")) {
			AntMessage.error("Invalid file type.");
			return false;
		}

		if (!(size / 1024 / 1024 < 2)) {
			AntMessage.error("Images must be smaller than 2MB.");
			return false;
		}

		const item: PostFormUploadItem = new PostFormUploadItem();
		item.uid = file.uid;
		item.size = size;
		item.type = type;

		const reader = new FileReader();
		reader.addEventListener("load", () => {
			const result: string = typeof reader.result === "string" ? reader.result : null;
			if (result) {
				item.dataURL = result;
				item.base64 = item.dataURL.replace(/^data:image\/(png|jpg|jpeg|gif);base64,/, "");

				const photos: PostFormUploadItem[] = this.state.photos;
				photos.push(item);

				this.setState({photos});
			}
		});
		reader.readAsDataURL(file);

		return false;
	};

	uploadChange = (info: UploadChangeParam) => {
	};

	content = () => {
		const used: number = this.state.message === null ? 0 : this.state.message.length;
		const user: User = Auth.getCurrentUser();
		if (!user) return "";

		return <div className={"postForm"}>
			{this.state.posting === false ? <div>
				<div className={"clearfix"}>
					<Button type={"link"} onClick={this.close} className={"float-left"} style={{fontSize: "20px"}}>
						<i className="fas fa-times"/>
					</Button>

					<Button type={"primary"} onClick={(e) => {
						this.send(e);
					}} className={"float-right"}>
						Send
					</Button>
				</div>
				<hr/>
				{/*{this.state.replyTo ? JSON.stringify(this.state.replyTo) : ""}*/}
				<Mentions rows={3} style={{resize: "none", width: "100%"}} id={"postFormTextarea"}
						  placeholder={"Post something for your followers!"} onChange={(e) => this.change(e)}
						  value={this.state.message} loading={this.state.loadingUsers} onSearch={text => {
					if (!text) {
						this.setState({
							suggestedUsers: []
						});
						return;
					}

					if (text.length < 3) return;

					this.setState({
						loadingUsers: true
					});

					API.handleRequest("/search", "GET", {
						query: text,
						type: "user",
						limit: 10
					}, data => {
						const results = [];

						if (data.hasOwnProperty("results")) {
							data.results.forEach(entry => {
								results.push(BaseObject.convertObject(User, entry));
							});
						}

						this.setState({
							suggestedUsers: results,
							loadingUsers: false
						});
					}, error => {
						AntMessage.error(error);

						this.setState({
							loadingUsers: false
						});
					});
				}}>
					{this.state.suggestedUsers.map((user: User, index: number) => {
						return <Mentions.Option key={index} value={user.getUsername()}
												className={"antd-demo-dynamic-option"}>
							<img src={user.getAvatarURL()} alt={user.getUsername()} className={"rounded mr-2"}
								 width={24} height={24}/>

							<span>
								<span className={"font-weight-bold"}>
									{user.getDisplayName()}<VerifiedBadge target={user}/>
								</span>

								<span className={"text-muted ml-2"}>
									{"@" + user.getUsername()}
								</span>
							</span>
						</Mentions.Option>;
					})}
				</Mentions>

				{this.state.photos.length > 0 ? <div className={"thumbnailHolder"}>
					{this.state.photos.map((photo: PostFormUploadItem) => {
						return <div className={"thumbnail"} key={photo.uid}>
							<Button type={"primary"} size={"small"} className={"deleteButton customDangerButton"}
									onClick={(e) => {
										e.preventDefault();

										const photos: PostFormUploadItem[] = this.state.photos;
										photos.splice(photos.indexOf(photo), 1);

										this.setState({photos});
									}}>
								<i className={"fas fa-trash-alt"}/>
							</Button>

							<div className={"thumbnailImage"}
								 style={{backgroundImage: "url('" + photo.dataURL + "')"}}/>
						</div>;
					})}
				</div> : ""}

				<div className={"clearfix bottom"}>
					<div className={"actionButtons"}>
						<Upload
							name={"image-upload"}
							listType={"text"}
							className={"uploader"}
							showUploadList={false}
							action={"https://qpo.st"}
							beforeUpload={this.beforeUpload}
							onChange={this.uploadChange}
							disabled={this.state.photos.length >= 4}
							multiple={true}
						>
							<Tooltip placement={"top"} title={"Add photos"}>
								<Button type={"link"} className={"actionButton"}
										disabled={this.state.photos.length >= 4}>
									<i className="fas fa-images"/>
								</Button>
							</Tooltip>
						</Upload>

						<Switch checkedChildren={"18+"} unCheckedChildren={"18+"} className={"mt-n2"}
								defaultChecked={this.state.nsfw} onChange={(checked: boolean, event: Event) => {
							this.setState({
								nsfw: checked
							});
						}}/>
					</div>

					<div className={"characterCount"}>
						{user.getCharacterLimit() - used}
					</div>
				</div>
			</div> : <div className={"text-center my-3"}>
				<Spin size={"large"}/>
			</div>}
		</div>;
	};

	render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
		this.setMobile(window.innerWidth);

		if (this.state.open) {
			$("body").addClass("disableScroll");

			setTimeout(() => {
				$("#postFormTextarea").focus();
			}, 200);

			return <div>
				{this.state.mobile ? <div key={0} className={"postFormBackdrop"}>
					{this.content()}
				</div> : ""}

				{!this.state.mobile ? <Modal
					key={1}
					title={null}
					footer={null}
					visible={this.state.open}
					className={"desktopOnly"}
					closable={false}
					onCancel={this.close}>
					{this.content()}
				</Modal> : ""}

				<WindowSizeListener onResize={windowSize => {
					this.setMobile(windowSize.windowWidth);
				}}/>
			</div>;
		} else {
			$("body").removeClass("disableScroll");

			return "";
		}
	}
}