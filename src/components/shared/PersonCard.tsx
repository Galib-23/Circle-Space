import { Models } from "appwrite"
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

type PersonCardProps = {
    person: Models.Document;
}

const PersonCard = ({ person }: PersonCardProps) => {
    return (
        <div className="flex justify-center p-3">
            <Link to={`/profile/${person.$id}`} className="flex flex-col items-center">
                <img
                    src={person.imageUrl}
                    alt="image"
                    className="w-16 h-w-16 rounded-full"
                />
                <h2 className="text-lg font-semibold mt-2">{person.name}</h2>
                <p className="mt-2">@{person.username}</p>
                <Button className="bg-purple-700 mt-2">
                    Follow
                </Button>
            </Link>
        </div>
    )
}

export default PersonCard
