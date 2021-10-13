import m from 'mongoose';

export const reqPaging=async(schema, page, perPage, filter={}, sort={_id:-1})=>{
    const offset=(page-1) * perPage;
    const data = await schema.find(filter, '' ,{skip:parseInt(offset), limit:parseInt(perPage), sort});
    const total = await schema.countDocuments(filter);
    return {data, total};
}

export const createModel=(schema)=>{
    const insert=async(body, uid)=>{
        return await schema.create({...body, createdBy:m.Types.ObjectId(uid)});
    }
    
    const update=async(body, id)=>{
        return await schema.findOneAndUpdate({_id:m.Types.ObjectId(id)}, {$set:{...body}});
    }

    return {insert, update, reqPaging};
}