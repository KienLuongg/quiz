import { Injectable } from "@angular/core";
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";
import { ToastrService } from "ngx-toastr";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private toastr: ToastrService) { }

    private errorMessages: { [key: number]: string } = {
        401: 'Unauthorized access. Please log in again.',
        403: 'You do not have permission to access this resource.',
        419: 'Your session has expired. Please log in again.',
        500: 'Server error. Please try again later.'
    };

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                const message = this.errorMessages[error.status] || 'An unexpected error occurred.';
                this.toastr.error(message);
                return throwError(error);
            })
        );
    }
}