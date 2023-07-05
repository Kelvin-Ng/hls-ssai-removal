import http from 'http';
import got from 'got';
import url from 'url';
import querystring from 'querystring';

function removeAds(input, baseUrlStr) {
    var output = [];

    const lines = input.split('\n');

    var numCont = 0;
    for (const line of lines) {
        if (line == '#EXT-X-DISCONTINUITY') {
            if (numCont <= 10) {
                for (var i = 0; i < numCont; ++i) {
                    output.pop();
                }
            }
            numCont = 0;
        } else {
            if (line[0] == '#') {
                output.push(line);
            } else {
                const lineUrl = new URL(line, baseUrlStr);
                output.push(lineUrl.toString());
            }

            ++numCont;
        }
    }

    return output.join('\n');
}

const requestHandler = async function (req, res) {
    console.log(req.url);
    const query = querystring.parse(url.parse(req.url).query);
    console.log(query);
    if (!('url' in query)) {
        res.writeHead(404);
        res.end();
        return;
    }

    try {
        const data = await got.get(query.url).text();
        const afterRemovedAds = removeAds(data, query.url);
        res.writeHead(200)
        res.end(afterRemovedAds)
    } catch (error) {
        console.log(error);
        res.writeHead(error.response.statusCode);
        res.end();
    }
};

http.createServer(requestHandler).listen(12345)

