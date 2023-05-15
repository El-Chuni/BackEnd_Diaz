const customError = (number, error) => {
    switch (number) {
        case 400:
            console.error('Bad request: ', error);
            break;

        case 404:
            console.error('File not (or not able to be) found: ', error);
            break;

        case 500:
            console.error('Internal Server Error:', error);
            break;

        default:
            console.error('Unknown error: ', error);
            break;
    }

    res.status(number).send(error);
};

export default customError;