import {Injectable} from "@angular/core";
import {API_URL} from "../../utils/config";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ApiResponse, Guide} from "../../admin/services/admin-guides.service";
import {GuideVille} from "../../pages/decouverte/guides-maroc";


@Injectable({
    providedIn: 'root'
})

export class GuidesService {
    private apiUrl = `${API_URL}/api/guides`; // Utilisation de la constante API_URL

    constructor(private http: HttpClient) {}

    // Obtenir tous les guides avec pagination
    getAllGuides(params?: {
        page?: number;
        limit?: number;
        actif?: boolean | 'all';
    }): Observable<ApiResponse<GuideVille[]>> {
        let httpParams = new HttpParams();

        if (params?.page) httpParams = httpParams.set('page', params.page.toString());
        if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
        if (params?.actif !== undefined) httpParams = httpParams.set('actif', params.actif.toString());

        return this.http.get<ApiResponse<GuideVille[]>>(this.apiUrl, {
            params: httpParams,
            withCredentials: true
        });
    }

    // Obtenir un guide par ID
    getGuideById(id: number): Observable<ApiResponse<Guide>> {
        return this.http.get<ApiResponse<Guide>>(`${this.apiUrl}/${id}`, {
            withCredentials: true
        });
    }
}
