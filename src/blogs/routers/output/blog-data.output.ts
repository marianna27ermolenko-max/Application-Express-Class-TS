import { ResourceType } from "../../../common/types/resource-type";

//используем в маппере(mapToBlogListPaginatedOutput), который преобраз-т ответ обьекта (блог) + пагинация - этот тип пишем именно для части дата:(в каком виде будем отдавать сам обьект)

export type BlogDataOutput = {
  type: ResourceType.Blogs;
  id: string;
  attributes: {
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string;
    isMembership: boolean;
  };
};
