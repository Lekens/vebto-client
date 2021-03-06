import {Injectable} from '@angular/core';
import {HttpErrorResponse} from "@angular/common/http";
import {CurrentUser} from "../../auth/current-user";
import {Router} from "@angular/router";
import {_throw} from "rxjs/observable/throw";
import {Toast} from "../ui/toast.service";
import {Translations} from "../../translations/translations.service";

@Injectable()
export class HttpErrorHandler {

    /**
     * HttpErrorHandler Constructor.
     */
    constructor(
        private i18n: Translations,
        private currentUser: CurrentUser,
        private router: Router,
        private toast: Toast,
    ) {}

    /**
     * Handle http request error.
     */
    public handle(response: HttpErrorResponse) {
        let body = this.parseJson(response.error),
            error = {messages: {}, type: 'http', status: response.status, originalError: new Error(response.message)};

        if (response.status === 403 || response.status === 401) {
            this.handle403Error(body);
        }

        //make sure there's always a "messages" object
        if (body) {
            error.messages = body.messages || {};
        }

        return _throw(error);
    }

    /**
     * Redirect user to login page or show toast informing
     * user that he does not have required permissions.
     */
    private handle403Error(response: object) {
        //if user doesn't have access, navigate to login page
        if (this.currentUser.isLoggedIn()) {
            let msg = "You don't have required permissions to do that.";
            this.toast.open(response['message'] ? response['message'] : msg);
        } else {
            this.router.navigate(['/login']);
        }
    }

    /**
     * Parse JSON without throwing errors.
     */
    private parseJson(json: string): {messages?: object} {
        if (typeof json !== 'string') return json;

        try {
            return JSON.parse(json);
        } catch (e) {
            return {};
        }
    }
}
