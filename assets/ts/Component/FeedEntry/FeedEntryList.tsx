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
import {Alert} from "reactstrap";
import FeedEntryListItem from "./FeedEntryListItem";
import API from "../../API";
import BaseObject from "../../api/src/BaseObject";
import LoadingFeedEntryListItem from "./LoadingFeedEntryListItem";
import Empty from "antd/es/empty";
import "antd/es/empty/style";
import InfiniteScroll from "react-infinite-scroller";
import {Spin} from "antd";
import Storage from "../../Util/Storage";
import FeedEntry from "../../api/src/Entity/FeedEntry";
import FeedEntryType from "../../api/src/Entity/FeedEntryType";
import __ from "../../i18n/i18n";
import HorizontalAd from "../Advertisment/HorizontalAd";

export default class FeedEntryList extends Component<{
	userID?: number,
	searchQuery?: string,
	disableTask?: boolean,
	type?: "posts" | "replies"
}, {
	entries: FeedEntry[] | null,
	error: string | null,
	loadingMore: boolean,
	hasMore: boolean,
	loadNewTask: any,
	privateWarning: boolean
}> {
	public static instance: FeedEntryList | null = null;

	constructor(props) {
		super(props);

		const storedEntries = Storage.sessionGet(this.storageName());

		this.state = {
			entries: storedEntries ? BaseObject.convertArray(FeedEntry, JSON.parse(storedEntries)) : null,
			error: null,
			loadingMore: false,
			hasMore: true,
			loadNewTask: null,
			privateWarning: false
		}
	}

	componentDidMount(): void {
		FeedEntryList.instance = this;
		this.load();
	}

	componentWillUnmount(): void {
		if (this.state.loadNewTask) {
			clearTimeout(this.state.loadNewTask);
		}

		FeedEntryList.instance = null;
	}

	componentDidUpdate(prevProps: Readonly<{ userID?: number; searchQuery?: string; disableTask?: boolean; type?: "posts" | "replies" }>, prevState: Readonly<{ entries: FeedEntry[] | null; error: string | null; loadingMore: boolean; hasMore: boolean; loadNewTask: any; privateWarning: boolean }>, snapshot?: any): void {
		if (this.props.userID !== prevProps.userID || this.props.searchQuery !== prevProps.searchQuery) {
			this.setState({
				entries: null,
				error: null,
				loadingMore: true,
				hasMore: true
			});

			this.load();
		}
	}

	public prependEntry(feedEntry: FeedEntry): void {
		if (this.hasEntry(feedEntry)) return;

		const entries: FeedEntry[] = this.state.entries || [];

		entries.unshift(feedEntry);

		this.setState({entries});
	}

	public replaceEntry(feedEntry: FeedEntry): void {
		const entries = [];

		this.state.entries.forEach(entry => {
			if (entry.getId() === feedEntry.getId()) {
				entries.push(feedEntry);
			} else {
				entries.push(entry);
			}
		});

		this.setState({
			entries
		});

		this.saveToStorage();
	}

	public hasEntry(feedEntry: FeedEntry, list?: FeedEntry[]): boolean {
		let result: boolean = false;

		(list || this.state.entries).forEach((entry: FeedEntry) => {
			if (entry.getId() === feedEntry.getId()) {
				result = true;
			}

			if (entry.getType() === FeedEntryType.REPLY || entry.getType() === FeedEntryType.SHARE) {
				const parent = entry.getParent();

				if (parent && parent.getId() === feedEntry.getId()) {
					result = true;
				}
			}

			if (feedEntry.getType() === FeedEntryType.REPLY || feedEntry.getType() === FeedEntryType.SHARE) {
				const parent = feedEntry.getParent();

				if (parent && parent.getId() === entry.getId()) {
					result = true;
				}
			}
		});

		return result;
	}

	loadNew() {
		if (this.state.entries === null || this.state.entries.length === 0) return;

		const parameters = this.props.userID ? {
			user: this.props.userID
		} : {};

		parameters["min"] = this.state.entries[0].getId();
		parameters["type"] = this.props.type || "posts";

		API.i.feed.get(this.props.type || "posts", this.props.userID, undefined, this.state.entries[0].getId()).then(value => {
			let entries: FeedEntry[] = [];

			value.forEach(feedEntry => {
				if (!(this.hasEntry(feedEntry, entries) || (this.state.entries && this.hasEntry(feedEntry, this.state.entries)))) {
					entries.push(feedEntry);
				}
			});

			if (this.state.entries) {
				this.state.entries.forEach(entry => {
					if (this.hasEntry(entry, entries)) {
						return;
					}

					entries.push(entry)
				});
			}

			this.setState({
				entries,
				loadingMore: false
			});

			this.saveToStorage();
			this.loadNewTask();
		}).catch(reason => {
			this.setState({error: reason, loadingMore: false});
			this.loadNewTask();
		});
	}

	load(max?: number) {
		const parameters = this.props.userID ? {
			user: this.props.userID
		} : {};

		if (max) parameters["max"] = max;
		if (this.props.searchQuery) {
			parameters["type"] = "post";
			parameters["query"] = this.props.searchQuery;
			if (this.state.entries && this.state.entries.length != 0) parameters["offset"] = this.state.entries.length;
		} else {
			parameters["type"] = this.props.type || "posts";
		}

		API.i.handleRequest(this.props.searchQuery ? "/search" : "/feed", "GET", parameters, data => {
			let entries: FeedEntry[] = (this.state.entries && max ? this.state.entries : null) || [];

			data.forEach(result => {
				const feedEntry: FeedEntry = BaseObject.convertObject(FeedEntry, result);

				if (this.hasEntry(feedEntry, entries)) {
					return;
				}

				entries.push(feedEntry);
			});

			this.setState({
				entries,
				loadingMore: false,
				hasMore: data.length === 0 ? false : this.state.hasMore
			});

			this.saveToStorage();

			if (!max) this.loadNewTask();
		}, error => {
			if (error === "You are not allowed to view this resource.") {
				this.setState({error, loadingMore: false, hasMore: false, privateWarning: true});
			} else {
				this.setState({error, loadingMore: false, hasMore: false});
			}
		});
	}

	private saveToStorage(): void {
		const limit: number = 15;
		const name: string = this.storageName();

		let entries = this.state.entries.slice(0);
		if (entries) {
			entries.length = Math.min(limit, entries.length);
		}

		Storage.sessionSet(name, JSON.stringify(entries), 3);
	}

	private storageName(): string {
		return Storage.SESSION_FEED_ENTRY_LIST + "_" + (this.props.userID ? this.props.userID : "0") + "_" + (this.props.type || "posts") + (this.props.searchQuery ? "_" + this.props.searchQuery : "");
	}

	private loadNewTask(): void {
		if (FeedEntryList.instance !== this || this.props.searchQuery || this.props.disableTask) return;

		this.setState({
			loadNewTask: setTimeout(() => {
				this.loadNew();
			}, 5000)
		});
	}

	loadMore() {
		if (!this.state.loadingMore && this.state.entries.length > 0 && this.state.hasMore) {
			const lastId = this.state.entries[this.state.entries.length - 1].getId();

			this.setState({
				loadingMore: true
			});

			this.load(lastId);
		}
	}

	render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
		if (this.state.privateWarning) {
			return <div className={"text-center my-5"}>
				<h4>{__("entryList.private.headline")}</h4>

				<p>{__("entryList.private.description")}</p>
			</div>;
		}

		if (this.state.entries !== null) {
			if (this.state.entries.length > 0) {
				return <InfiniteScroll
					pageStart={1}
					loadMore={() => {
						this.loadMore();
					}}
					hasMore={this.state.hasMore}
					loader={<div className={"text-center my-3" + (!this.state.loadingMore ? " d-none" : "")}>
						<Spin size={"large"}/>
					</div>}
					initialLoad={false}
				>
					<ul className={"list-group feedContainer"}>
						{this.state.entries.map((entry, i) => {
							const maxAds = 10;
							const adIndexes: number[] = [];
							for (let j = 0; j < maxAds; j++) {
								adIndexes.push(15 * j + 5);
							}

							const components = [];

							if (adIndexes.indexOf(i) !== -1) {
								components.push(<HorizontalAd marginDirection={"y"}/>);
							}

							components.push(<FeedEntryListItem key={entry.getId()} entry={entry} parent={this}
															   showParentInfo={true}/>);

							return components;
						})}
					</ul>
				</InfiniteScroll>;
			} else {
				return <div className={"mt-3"}>
					<Empty description={__("entryList.empty")}/>
				</div>;
			}
		} else if (this.state.error !== null) {
			return <Alert color={"danger"}>{this.state.error}</Alert>;
		} else {
			const rows = [];
			for (let i = 0; i < 20; i++) {
				rows.push(<LoadingFeedEntryListItem key={i}/>);
			}

			return <ul className={"list-group feedContainer"}>
				{rows.map((item, i) => {
					return item;
				})}
			</ul>;
			/*return <div className={"text-center my-3"}>
				<Spinner type={"grow"} color={NightMode.spinnerColor()} size={"lg"}/>
			</div>*/
		}
	}
}