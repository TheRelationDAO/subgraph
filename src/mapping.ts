import {
  FollowEvt,
  ProfileEvt,
  RegisterEvt,
  Transfer,
  UnFollowEvt,
} from "../generated/TheRelationDAO/TheRelationDAO";
import { People, Follow } from "../generated/schema";
import { BigInt, store } from "@graphprotocol/graph-ts";

export function handleRegisterEvt(event: RegisterEvt): void {
  let id = event.params._from.toString();
  let people = People.load(id);
  if (people == null) {
    people = new People(id);
    people.owner = event.params._owner;
    people.followCount = BigInt.fromI32(0);
    people.followedCount = BigInt.fromI32(0);
  }

  people.profile = event.params._profile;

  people.save();
}

export function handleTransfer(event: Transfer): void {
  let id = event.params.tokenId.toString();
  let people = People.load(id);
  if (people == null) {
    people = new People(id);
    people.followCount = BigInt.fromI32(0);
    people.followedCount = BigInt.fromI32(0);
    people.profile = "";
  }

  people.owner = event.params.to;

  people.save();
}

export function handleFollowEvt(event: FollowEvt): void {
  let id = event.params._from.toString() + ":" + event.params._to.toString();
  let follow = Follow.load(id);

  if (follow == null) {
    follow = new Follow(id);
    follow.fromId = event.params._from;
    follow.toId = event.params._to;
    follow.save();

    let followPeople = People.load(event.params._from.toString());
    if (followPeople) {
      followPeople.followCount?.plus(BigInt.fromI32(1));
      followPeople.save();
    }

    let followedPeople = People.load(event.params._to.toString());
    if (followedPeople) {
      followedPeople.followedCount?.plus(BigInt.fromI32(1));
      followedPeople.save();
    }
  }
}

export function handleProfileEvt(event: ProfileEvt): void {
  let id = event.params._from.toString();
  let people = People.load(id);
  if (people != null) {
    people.profile = event.params._profile;
    people.save();
  }
}

export function handleUnFollowEvt(event: UnFollowEvt): void {
  let id = event.params._from.toString() + ":" + event.params._to.toString();
  let follow = Follow.load(id);
  if (follow != null) {
    store.remove("Follow", id);

    let followPeople = People.load(event.params._from.toString());
    if (followPeople) {
      followPeople.followCount?.minus(BigInt.fromI32(1));
      followPeople.save();
    }

    let followedPeople = People.load(event.params._to.toString());
    if (followedPeople) {
      followedPeople.followedCount?.minus(BigInt.fromI32(1));
      followedPeople.save();
    }
  }
}
