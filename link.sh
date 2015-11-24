#!/bin/bash
mkdir -p _allcontrollers
mkdir -p _allmodels
mkdir -p _allpolicies
mkdir -p _allroutes
rm _allcontrollers/*
rm _allmodels/*
rm _allpolicies/*
rm _allroutes/*

for DIRECTORY in $(find modules -name "controllers"); do
	if [[ $DIRECTORY == */server/controllers ]]; then
		echo $DIRECTORY
		ln -s $PWD/${DIRECTORY}/*.js _allcontrollers/
	fi
done;
for DIRECTORY in $(find modules -name "models"); do
	if [[ $DIRECTORY == */server/models ]]; then
		echo $DIRECTORY
		ln -s $PWD/${DIRECTORY}/*.js _allmodels/
	fi
done;
for DIRECTORY in $(find modules -name "policies"); do
	if [[ $DIRECTORY == */server/policies ]]; then
		echo $DIRECTORY
		ln -s $PWD/${DIRECTORY}/*.js _allpolicies/
	fi
done;
for DIRECTORY in $(find modules -name "routes"); do
	if [[ $DIRECTORY == */server/routes ]]; then
		echo $DIRECTORY
		ln -s $PWD/${DIRECTORY}/*.js _allroutes/
	fi
done;
