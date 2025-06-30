import { Injectable } from "@angular/core";
import { API_URL } from "../../utils/config";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, Observable, tap, throwError } from "rxjs";
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CommunityService {
    private readonly apiUrl = `${API_URL}/communities`;
    constructor(
        private http: HttpClient,
        private router: Router,
    ) {}

    getRandomPosts(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/randomPosts`).pipe(
            tap((response) => {
                console.log('Fetched random posts:', response);
            }),
            map((response) => response.posts?.posts ?? []),
            catchError((error) => {
                console.error('Error fetching random posts:', error);
                return throwError(() => new Error('Error fetching random posts'));
            })
        );
    }

    getRandomCommunities(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/randomCommunities`).pipe(
            tap((response) => {
                console.log('Fetched random communities:', response);
            }),
            map((response) => response.communities ?? []),
            catchError((error) => {
                console.error('Error fetching random communities:', error);
                return throwError(() => new Error('Error fetching random communities'));
            })
        );
    }

    getCommunityByName(name: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/name`, { params: { name } }).pipe(
            tap((response) => {
                console.log('Fetched community by name:', response);
            }),
            catchError((error) => {
                console.error('Error fetching community by name:', error);
                return throwError(() => error);
            })
        );
    }

    getCommunityById(communityId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${communityId}`).pipe(
            tap((response) => {
                console.log('Fetched community by ID:', response);
            }),
            catchError((error) => {
                console.error('Error fetching community by ID:', error);
                return throwError(() => error);
            })
        );
    }

    getCommunityPosts(communityId: number, options?: { page?: number; limit?: number }): Observable<any> {
        const params: any = {};
        if (options?.page !== undefined) params.page = options.page.toString();
        if (options?.limit !== undefined) params.limit = options.limit.toString();

        return this.http.get<any>(`${this.apiUrl}/${communityId}/posts`, { params }).pipe(
            tap((response) => {
                console.log('Fetched community posts:', response);
            }),
            catchError((error) => {
                console.error('Error fetching community posts:', error);
                return throwError(() => error);
            })
        );
    }

    getCommunityPostById(communityId: number, postId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${communityId}/posts/${postId}`).pipe(
            tap((response) => {
                console.log('Fetched community post by ID:', response);
            }),
            catchError((error) => {
                console.error('Error fetching community post by ID:', error);
                return throwError(() => error);
            })
        );
    }

    checkIfUserIsMember(communityId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${communityId}/isMember`, { withCredentials: true }).pipe(
            map((response) => {
                console.log('Checked if user is member:', response);
                return response.response.isMember;
            }),
            catchError((error) => {
                console.error('Error checking if user is member:', error);
                return throwError(() => error);
            })
        );
    }

    joinCommunity(communityId: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${communityId}/join`, {}, { withCredentials: true }).pipe(
            tap((response) => {
                console.log('Joined community successfully:', response);
            }),
            catchError((error) => {
                console.error('Error joining community:', error);
                return throwError(() => error);
            })
        );
    }

    leaveCommunity(communityId: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${communityId}/leave`, {}, { withCredentials: true }).pipe(
            tap((response) => {
                console.log('Left community successfully:', response);
            }),
            catchError((error) => {
                console.error('Error leaving community:', error);
                return throwError(() => error);
            })
        );
    }

    addCommentToPost(communityId: number, postId: number, content: string): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/${communityId}/posts/${postId}/comments`,
            { content },
            { withCredentials: true }
        ).pipe(
            tap((response) => {
                console.log('Added comment to post:', response);
            }),
            catchError((error) => {
                console.error('Error adding comment to post:', error);
                return throwError(() => error);
            })
        );
    }

    addReplyToComment(communityId: number, postId: number, commentId: number, content: string): Observable<any> {
        return this.http.post<any>(
            // /:communityId/posts/:postId/comments/:commentId
            `${this.apiUrl}/${communityId}/posts/${postId}/comments/${commentId}`,
            { content },
            { withCredentials: true }
        ).pipe(
            tap((response) => {
                console.log('Reply added successfully:', response);
            }),
            catchError((error) => {
                console.error('Error adding reply:', error);
                return throwError(() => error);
            })
        );
    }

    likeDislikePost(communityId: number, postId: number): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/${communityId}/posts/${postId}/likeDislike`,
            {},
            { withCredentials: true }
        ).pipe(
            tap((response) => {
                console.log(`Interacted with post successfuly`, response);
            }),
            catchError((error) => {
                console.error(`Error interacting with post:`, error);
                return throwError(() => error);
            })
        );
    }

    likeDislikeComment(communityId: number, postId: number, commentId: number): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/${communityId}/posts/${postId}/comments/${commentId}/likeDislike`,
            {},
            { withCredentials: true }
        ).pipe(
            tap((response) => {
                console.log(`Interacted with comment successfuly`, response);
            }),
            catchError((error) => {
                console.error(`Error interacting with comment:`, error);
                return throwError(() => error);
            })
        );
    }

    deletePost(communityId: number, postId: number): Observable<any> {
        return this.http.delete<any>(
            `${this.apiUrl}/${communityId}/posts/${postId}`,
            { withCredentials: true }
        ).pipe(
            tap((response) => {
                console.log(`Post deleted successfully`, response);
            }),
            catchError((error) => {
                console.error(`Error deleting post:`, error);
                return throwError(() => error);
            })
        );
    }

    deleteComment(communityId: number, postId: number, commentId: number): Observable<any> {
        return this.http.delete<any>(
            `${this.apiUrl}/${communityId}/posts/${postId}/comments/${commentId}`,
            { withCredentials: true }
        ).pipe(
            tap((response) => {
                console.log(`Comment deleted successfully`, response);
            }),
            catchError((error) => {
                console.error(`Error deleting comment:`, error);
                return throwError(() => error);
            })
        );
    }
}
