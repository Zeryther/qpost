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

import React from "react";
import {Redirect, Route, RouteComponentProps, RouteProps} from "react-router-dom";
import Auth from "./Auth";

interface IPrivateRouteProps extends RouteProps {
	component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>
}

type RenderComponent = (props: RouteComponentProps<any>) => React.ReactNode;

export default class PrivateRoute extends Route<IPrivateRouteProps> {
	render() {
		const {component: Component, ...rest}: IPrivateRouteProps = this.props;

		const renderComponent: RenderComponent = (props) => (
			Auth.isLoggedIn()
				? <Component {...props} />
				: <Redirect to='/login'/>
		);

		return (
			<Route {...rest} render={renderComponent}/>
		);
	}
}