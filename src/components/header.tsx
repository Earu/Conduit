import * as React from 'react';

export class Header extends React.Component<{}, {}> {
	render(): JSX.Element {
		return <div className='header' style={{ position: 'absolute' }}>
			<img src='./public/img/logo_brand.png' alt='logo' />
			<h1 style={{ display: 'none' }}>Conduit</h1>
		</div>
	}
}