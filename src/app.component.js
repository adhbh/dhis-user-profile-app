import React from 'react';
import log from 'loglevel';
import {hashHistory} from 'react-router';

// Material UI
import Snackbar from 'material-ui/lib/snackbar';

import settingsActions from './userSettingsActions';
import { categories } from './userSettingsCategories';

import HeaderBar from 'd2-ui/lib/header-bar/HeaderBar.component';
import Sidebar from 'd2-ui/lib/sidebar/Sidebar.component';

import UserSettingsFields from './userSettingsFields.component';

import AppTheme from './theme';

class App extends React.Component {
    constructor(props, context){
        super(props, context);
        this.state = Object.assign({},{
            category: props.route.path === '/' ? 'profile' : props.route.path,
            snackbarMessage: '',
            showSnackbar: false,
            formValidator: undefined,
        });
        this.props = props;
        this.closeSnackbar = this.closeSnackbar.bind(this);
        this.getTranslation = props.route.d2.i18n.getTranslation.bind(props.route.d2.i18n);
    }

    getChildContext() {
        return {
            d2: this.props.route.d2,
            muiTheme: AppTheme,
        };
    }

    componentDidMount() {
        this.subscriptions = [];

        /* eslint-disable complexity */
        this.subscriptions.push(settingsActions.setCategory.subscribe((arg) => {
            const category = arg.data.key || arg.data || categoryOrder[0];
            hashHistory.push(category);
        }));
        /* eslint-enable complexity */

        this.subscriptions.push(settingsActions.showSnackbarMessage.subscribe(params => {
            const message = params.data;
            this.setState({ snackbarMessage: message, showSnackbar: !!message });
        }));
    }

    componentWillUnmount() {
        this.subscriptions.forEach(sub => {
            sub.dispose();
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ category: nextProps.route.path });
    }

    closeSnackbar() {
        this.setState({ showSnackbar: false });
    }

    render() {

        const styles = {
            header: {
                fontSize: 24,
                fontWeight: 100,
                color: AppTheme.rawTheme.palette.textColor,
                padding: '6px 16px',
            },
            card: {
                marginTop: 8,
                marginRight: '1rem',
            },
            cardTitle: {
                background: AppTheme.rawTheme.palette.primary2Color,
                height: 62,
            },
            cardTitleText: {
                fontSize: 28,
                fontWeight: 100,
                color: AppTheme.rawTheme.palette.alternateTextColor,
            },
            forms: {
                minWidth: AppTheme.forms.minWidth,
                maxWidth: AppTheme.forms.maxWidth,
            },
        };

        const sideBarSections = [
            { key: 'profile', label: this.getTranslation('user_profile'), icon: 'face' },
            { key: 'account', label: this.getTranslation('account_settings'), icon: 'account_circle' },
            { key: 'user', label: this.getTranslation('user_settings'), icon: 'build' },
        ];

        const setSidebar = (ref) => {
            this.sidebar = ref;
        };

        return (
            <div className="app-wrapper">
                <HeaderBar />
                 <Snackbar
                    message={this.state.snackbarMessage || ''}
                    autoHideDuration={1250}
                    open={this.state.showSnackbar}
                    onRequestClose={this.closeSnackbar}
                    style={{ left: 24, right: 'inherit' }}
                />
                <Sidebar
                    sections={sideBarSections}
                    onChangeSection={settingsActions.setCategory}
                    ref={setSidebar}
                    currentSection={this.state.category}
                />

                <UserSettingsFields category={this.state.category} currentSettings={categories[this.state.category].settings} />
            </div>
        );
    }
}

App.propTypes = { d2: React.PropTypes.object, };
App.childContextTypes = { d2: React.PropTypes.object, muiTheme: React.PropTypes.object, };

export default App;
