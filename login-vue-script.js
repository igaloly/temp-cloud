const LeftPane = Vue.component('LeftPane', {
	template: `
        <div class="left-pane">
            <div class="circle"></div>
            <div class="logo">
                <img src="https://res.cloudinary.com/aporia/image/upload/v1577180954/logo_hpmkgc.png" />
                <p>Aporia</p>
            </div>
        </div>
    `,
})

const MiddlePane = Vue.component('MiddlePane', {
	template: `
        <div class="middle-pane">
            <div class="triangle"></div>
        </div>
    `,
})

const SSOArea = Vue.component('SSOArea', {
	template: `
        <div class="sso-area content-container">
            <button class="dark-button">Login with google</button>
        </div>
    `,
})

const LoginScreen = Vue.component('LoginScreen', {
	model: {
		prop: 'credentials',
	},
	props: {
		credentials: Object, // email, password
	},
	methods: {
		emitCredential(key, value) {
			this.$emit('input', {
				...this.credentials,
				[key]: value,
			})
		},
	},
	template: `
        <div class="login-screen" class="content-container">
            <div class="content-title">Login</div>
            <form @submit.prevent="$emit('login')" class="content-container">
                <input 
                    :value="credentials.email" 
                    @input="emitCredential('email', $event.target.value)" 
                    placeholder="Enter your e-mail" 
                    type="email" 
                    class="content-input" 
                />
                <input 
                    :value="credentials.password" 
                    @input="emitCredential('password', $event.target.value)" 
                    placeholder="Password" 
                    type="password" 
                    class="content-input" 
                />
                <button class="dark-button" type="submit">Login</button>
                <div>Don't have an account? <button class="text-link" @click="$emit('modeChange', 'signup')">Join us now!</button></div>
            </form>
        </div>
    `,
})

const SignupScreen = Vue.component('SignupScreen', {
	model: {
		prop: 'credentials',
	},
	props: {
		credentials: Object, // email, password
	},
	methods: {
		emitCredential(key, value) {
			this.$emit('input', {
				...this.credentials,
				[key]: value,
			})
		},
	},
	template: `
        <div class="signup-screen content-container">
        <div class="content-title">Signup</div>
            <form @submit.prevent="$emit('signup')" class="content-container">
                <input 
                    :value="credentials.email" 
                    @input="emitCredential('email', $event.target.value)" 
                    placeholder="Enter your e-mail" 
                    type="email" 
                    class="content-input" 
                />
                <input 
                    :value="credentials.password" 
                    @input="emitCredential('password', $event.target.value)" 
                    placeholder="Password" 
                    type="password" 
                    class="content-input" 
                />
                <button class="dark-button" type="submit">Signup</button>
                <div>Already have an account? <button class="text-link" @click="$emit('modeChange', 'login')">Login now!</button></div>
            </form>
        </div>
    `,
})

const SeperatorLine = Vue.component('SeperatorLine', {
    template: `
        <div class="seperator-line">
        OR
        </div>
    `
})

const RightPane = Vue.component('RightPane', {
    components: {SSOArea, LoginScreen, SignupScreen, SeperatorLine},
	data() {
		return {
            webAuth: null,
			mode: 'login',
			credentials: {
				email: '',
				password: '',
            },
            errors: ''
		}
	},
	created() {
        const currentLocationUri = new URI()
        let config = {callbackURL: 'https://www.google.com/', auth0Domain: '', clientID: ''}
        if(!currentLocationUri.toString().startsWith('file')) {
            config = JSON.parse(decodeURIComponent(escape(window.atob('@@config@@'))))
        }
        const callbackUri = new URI(config.callbackURL)
        const inviteToken = currentLocationUri.search(true).invite_token
        if (inviteToken) {
            this.mode = 'signup'
            callbackUri.addQuery('invite_token', inviteToken)
        }
		const params = Object.assign(
			{
				/* 
                    additional configuration needed for use of custom domains
                    overrides: {
                        __tenant: config.auth0Tenant,
                        __token_issuer: 'YOUR_CUSTOM_DOMAIN'
                    }, 
                */
				domain: config.auth0Domain,
				clientID: config.clientID,
				redirectUri: callbackUri.toString(),
				responseType: 'code',
			},
			config.internalOptions,
        )
        this.webAuth = new auth0.WebAuth(params)
	},
	methods: {
		tryToLogin() {
            this.webAuth.login(
                {
                    realm: 'Email-Password-Database-Authentication',
                    username: this.credentials.email,
                    password: this.credentials.password,
                },
                function (err) {
                    if (err) this.errors = err
                },
            )
        },
        tryToSignup() {
            webAuth.redirect.signupAndLogin(
                {
                    connection: 'Email-Password-Database-Authentication',
                    email: this.credentials.email,
                    password: this.credentials.password,
                },
                function (err) {
                    if (err) this.errors = err
                },
            )
        },
        authorizeWithGoogle() {
            webAuth.authorize(
                {
                    connection: 'google-oauth2',
                },
                function (err) {
                    if (err) this.errors = err
                },
            )
        },
	},
	template: `
        <div class="right-pane">
            <div class="content-container-size content-container">
                <SSOArea />
                <SeperatorLine />
                <LoginScreen v-if="mode === 'login'" v-model="credentials" @login="tryToLogin" @modeChange="mode = $event" />
                <SignupScreen v-if="mode === 'signup'" v-model="credentials" @login="tryToSignup" @modeChange="mode = $event" />
            </div>
        </div>
    `,
})

const vueApp = new Vue({
    el: '#app',
    components: {LeftPane, MiddlePane, RightPane},
	data() {
		return {}
	},
	template: `
      <div id="app" class="container">
        <LeftPane />
        <MiddlePane />
        <RightPane />
      </div>
    `,
})

/*
Right pane contains
two modes, login and signup
there's a main block above with all the SSO:
continue with google,
continue with microsoft etc...
the botton block is switched by click on text below "Already have an account?" or "Doesn't have an account?"
Login page and signup pages have email and password fields
*/
