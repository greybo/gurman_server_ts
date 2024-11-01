
interface OrderUpdateBody {
    externalId: string;
    form: string;
    id: string;
    data: Data;
}

interface Data{
    statusId: string;
}

export {
    OrderUpdateBody
};