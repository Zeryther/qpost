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
import {formatNumberShort} from "../../../Util/Format";
import FeedEntryActionButtons from "./FeedEntryActionButtons";
import Auth from "../../../Auth/Auth";
import LoginSuggestionModal from "../../LoginSuggestionModal";
import PostForm from "../../PostForm/PostForm";
import FeedEntry from "../../../api/src/Entity/FeedEntry";

export default class ReplyButton extends Component<{
	entry: FeedEntry,
	parent?: FeedEntryActionButtons
}, any> {
	click = (e) => {
		e.preventDefault();
		e.stopPropagation();

		if (Auth.isLoggedIn()) {
			// TODO
			const postForm = PostForm.INSTANCE;
			if (postForm) {
				postForm.setState({
					open: true,
					replyTo: this.props.entry
				});
			}
		} else {
			LoginSuggestionModal.open();
		}
	};

	render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
		return <div className={"d-inline-block replyButton"} onClick={(e) => this.click(e)}>
			<i className={"fas fa-share"}/><span
			className={"number"}>{formatNumberShort(this.props.entry.getReplyCount())}</span>
		</div>;
	}
}