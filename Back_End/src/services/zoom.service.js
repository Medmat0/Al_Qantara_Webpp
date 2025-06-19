import axios from "axios";
import qs from "qs";

const getZoomAccessToken = async () => {
    const response = await axios.post(
        'https://zoom.us/oauth/token',
        qs.stringify({
            grant_type: 'account_credentials',
            account_id: process.env.ZOOM_ACCOUNT_ID,
        }),
        {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(
                    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
                ).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );
    return response.data.access_token;
};

const createZoomMeeting = async (candidateEmail, startTime) => {
    const token = await getZoomAccessToken();

    const res = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
            topic: 'Entretien avec un candidat',
            type: 2,
            start_time: startTime,
            duration: 40,
            timezone: 'Europe/Paris',
            settings: {
                join_before_host: false,
                approval_type: 0,
                registration_type: 1,
                enforce_login: false,
                waiting_room: true,
            },
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return res.data;
};

export { createZoomMeeting };